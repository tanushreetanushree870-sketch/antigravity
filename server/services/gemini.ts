import { GoogleGenAI } from '@google/genai';
import { EmergencyAnalysisSchema } from '../schemas/index.js';
import type { EmergencyAnalysis, EmergencyCategory, EmergencySeverity } from '../../shared/types/index.js';

const SYSTEM_INSTRUCTION = `You are an emergency assistance classification AI.
Your role is to analyze a user's description of an emergency and determine what category of emergency assistance may be relevant.
You are NOT a doctor, emergency dispatcher, lawyer, or emergency responder.
Do not diagnose medical conditions.
Do not prescribe medication.
Do not invent hospitals, pharmacies, ambulances, phone numbers, addresses, opening hours, or service availability.
If the description may represent a life-threatening emergency, clearly indicate that the user should contact the appropriate official emergency service immediately.

Supported categories:
- medical
- accident
- ambulance
- pharmacy
- blood
- fire
- police
- general

Supported severity:
- low
- moderate
- high
- critical
- unknown

Return ONLY valid JSON matching this schema:
{
  "category": "medical",
  "severity": "high",
  "urgency": "immediate",
  "requiresEmergencyContact": true,
  "recommendedResourceTypes": ["ambulance", "emergency_department", "hospital"],
  "safetyGuidance": "Safety instructions here..."
}`;

/**
 * Intelligent deterministic safety fallback classifier
 * Used when GEMINI_API_KEY is not configured or in case of API outages/quotas.
 */
function runRuleBasedEmergencyClassification(
  description: string,
  userSelectedCategory?: EmergencyCategory
): EmergencyAnalysis {
  const text = description.toLowerCase();

  // Critical indicators
  const isLifeThreatening =
    text.includes('chest pain') ||
    text.includes('heart attack') ||
    text.includes('unconscious') ||
    text.includes('not breathing') ||
    text.includes('cannot breathe') ||
    text.includes('stopped breathing') ||
    text.includes('stroke') ||
    text.includes('severe bleeding') ||
    text.includes('massive bleeding') ||
    text.includes('choking') ||
    text.includes('anaphylaxis') ||
    text.includes('head trauma') ||
    text.includes('drowning') ||
    text.includes('cardiac arrest');

  // Fire indicators
  if (text.includes('fire') || text.includes('smoke') || text.includes('flame') || text.includes('trapped in building') || text.includes('gas leak') || userSelectedCategory === 'fire') {
    return {
      category: 'fire',
      severity: isLifeThreatening || text.includes('trapped') || text.includes('spreading') ? 'critical' : 'high',
      urgency: 'immediate',
      requiresEmergencyContact: true,
      recommendedResourceTypes: ['fire_station', 'emergency_service', 'ambulance'],
      safetyGuidance: 'Evacuate immediately to a safe location upwind. Do not use elevators. If safe to do so, call your local fire emergency number immediately.',
      isAiFallback: true
    };
  }

  // Police / Crime / Threat indicators
  if (text.includes('robbery') || text.includes('burglary') || text.includes('assault') || text.includes('weapon') || text.includes('violence') || text.includes('threat') || text.includes('intruder') || text.includes('theft') || userSelectedCategory === 'police') {
    return {
      category: 'police',
      severity: text.includes('weapon') || text.includes('assault') ? 'critical' : 'high',
      urgency: 'immediate',
      requiresEmergencyContact: true,
      recommendedResourceTypes: ['police_station', 'emergency_service'],
      safetyGuidance: 'Ensure your personal safety first. Move to a secure location away from danger. Do not confront suspects. Contact law enforcement immediately.',
      isAiFallback: true
    };
  }

  // Blood requirement
  if (text.includes('blood') || text.includes('platelet') || text.includes('plasma') || text.includes('donor') || text.includes('transfusion') || userSelectedCategory === 'blood') {
    return {
      category: 'blood',
      severity: isLifeThreatening ? 'critical' : 'moderate',
      urgency: isLifeThreatening ? 'immediate' : 'urgent',
      requiresEmergencyContact: isLifeThreatening,
      recommendedResourceTypes: ['blood_bank', 'hospital', 'emergency_department'],
      safetyGuidance: 'Locate certified blood banks and hospital transfusion units. In case of acute hemorrhage, seek emergency medical care immediately.',
      isAiFallback: true
    };
  }

  // Accident indicators
  if (text.includes('accident') || text.includes('crash') || text.includes('collision') || text.includes('bike') || text.includes('car') || text.includes('pedestrian') || userSelectedCategory === 'accident') {
    return {
      category: 'accident',
      severity: isLifeThreatening || text.includes('bleeding') || text.includes('broken') ? 'critical' : 'high',
      urgency: 'immediate',
      requiresEmergencyContact: true,
      recommendedResourceTypes: ['ambulance', 'emergency_department', 'hospital', 'police_station'],
      safetyGuidance: 'Ensure scene safety from oncoming traffic. Do not move injured individuals unless there is imminent danger of explosion or fire. Apply gentle pressure to wounds with clean cloth.',
      isAiFallback: true
    };
  }

  // Pharmacy / medication
  if ((text.includes('pharmacy') || text.includes('medicine') || text.includes('prescription') || text.includes('bandage') || text.includes('first aid kit')) && !isLifeThreatening && userSelectedCategory !== 'medical') {
    return {
      category: 'pharmacy',
      severity: 'low',
      urgency: 'standard',
      requiresEmergencyContact: false,
      recommendedResourceTypes: ['pharmacy', 'emergency_service'],
      safetyGuidance: 'Visit a licensed 24-hour pharmacy or dispensary. Consult the pharmacist regarding correct dosages and emergency supplies.',
      isAiFallback: true
    };
  }

  // Ambulance explicit request
  if (text.includes('ambulance') || userSelectedCategory === 'ambulance') {
    return {
      category: 'ambulance',
      severity: isLifeThreatening ? 'critical' : 'high',
      urgency: 'immediate',
      requiresEmergencyContact: true,
      recommendedResourceTypes: ['ambulance', 'emergency_department', 'hospital'],
      safetyGuidance: 'Call local emergency dispatch right away. Keep caller line open and provide exact location landmarks. Keep the patient calm and stationary.',
      isAiFallback: true
    };
  }

  // Medical general / critical
  if (isLifeThreatening || text.includes('pain') || text.includes('sick') || text.includes('fever') || text.includes('vomit') || text.includes('allergic') || text.includes('injury') || text.includes('fall') || userSelectedCategory === 'medical') {
    const sev: EmergencySeverity = isLifeThreatening ? 'critical' : (text.includes('severe') ? 'high' : 'moderate');
    return {
      category: 'medical',
      severity: sev,
      urgency: isLifeThreatening ? 'immediate' : 'urgent',
      requiresEmergencyContact: isLifeThreatening,
      recommendedResourceTypes: isLifeThreatening ? ['ambulance', 'emergency_department', 'hospital'] : ['hospital', 'emergency_department', 'pharmacy'],
      safetyGuidance: isLifeThreatening
        ? 'Call official emergency services immediately. Keep the patient comfortable and still. Monitor breathing and stay on the line with dispatchers.'
        : 'Proceed to the nearest emergency department or medical center for professional evaluation. Do not consume food or drink if surgery may be required.',
      isAiFallback: true
    };
  }

  // Default / general fallback
  const cat = userSelectedCategory || 'general';
  return {
    category: cat,
    severity: 'moderate',
    urgency: 'urgent',
    requiresEmergencyContact: false,
    recommendedResourceTypes: ['hospital', 'emergency_department', 'emergency_service'],
    safetyGuidance: 'Assess surroundings for safety. Contact appropriate professional assistance and keep access clear for responders.',
    isAiFallback: true
  };
}

/**
 * Main Gemini Emergency Analyzer
 */
export async function analyzeEmergencyWithGemini(
  description: string,
  userCategory?: EmergencyCategory
): Promise<EmergencyAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no Gemini API key configured, use our safe deterministic rule-based classifier
  if (!apiKey) {
    console.log('[GeminiService] GEMINI_API_KEY is not set. Using safe emergency heuristic engine.');
    return runRuleBasedEmergencyClassification(description, userCategory);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `Analyze this emergency description:
"${description}"
${userCategory ? `User selected category hint: "${userCategory}"` : ''}

Classify the situation and return structured JSON following the required system instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      }
    });

    const rawOutput = response.text?.trim();
    if (!rawOutput) {
      throw new Error('Gemini returned an empty response');
    }

    // Clean any markdown formatting if present
    const cleanedOutput = rawOutput
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsedJson = JSON.parse(cleanedOutput);

    // Validate strictly with Zod schema
    const validationResult = EmergencyAnalysisSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.warn('[GeminiService] Gemini JSON did not pass Zod validation:', validationResult.error.format());
      throw new Error('AI output failed schema validation');
    }

    return {
      ...validationResult.data,
      isAiFallback: false
    };
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini API, safely falling back:', (error as Error).message);
    // Graceful fallback to guarantee user safety and zero application crashes
    return runRuleBasedEmergencyClassification(description, userCategory);
  }
}

import { Router } from 'express';
import { EmergencyRequestSchema, CreateReportSchema } from '../schemas/index.js';
import { analyzeEmergencyWithGemini } from '../services/gemini.js';
import { query, calculateHaversineDistance } from '../db/index.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import type { EmergencyResource } from '../../shared/types/index.js';

const router = Router();

// POST /api/emergency/analyze
router.post('/analyze', async (req, res) => {
  try {
    const parseResult = EmergencyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid emergency description'
      });
      return;
    }

    const { description, category, latitude, longitude } = parseResult.data;

    // Run Gemini Analysis with fallback guarantee
    const analysis = await analyzeEmergencyWithGemini(description, category);

    // Find recommended nearby emergency resources based on analysis
    const allResourcesRes = await query<EmergencyResource>('SELECT * FROM emergency_resources');
    let resources = allResourcesRes.rows;

    // Filter resources matching recommended types if available
    const recTypes = analysis.recommendedResourceTypes.map(t => t.toLowerCase());
    const matchedResources = resources.filter(r =>
      recTypes.includes(r.resource_type.toLowerCase()) ||
      recTypes.some(rt => r.resource_type.toLowerCase().includes(rt) || rt.includes(r.resource_type.toLowerCase()))
    );

    const targetList = matchedResources.length > 0 ? matchedResources : resources;

    // If user coordinates provided, calculate distance and sort
    let formattedResources = targetList.map(r => {
      let distance_km: number | undefined;
      if (latitude != null && longitude != null && r.latitude != null && r.longitude != null) {
        distance_km = calculateHaversineDistance(latitude, longitude, r.latitude, r.longitude);
      }
      return {
        ...r,
        distance_km
      };
    });

    if (latitude != null && longitude != null) {
      formattedResources.sort((a, b) => (a.distance_km ?? 99999) - (b.distance_km ?? 99999));
    }

    res.json({
      success: true,
      data: {
        analysis,
        resources: formattedResources.slice(0, 8)
      }
    });
  } catch (err) {
    console.error('[Emergency Analyze Error]', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while analyzing the emergency request'
    });
  }
});

// POST /api/emergency/reports
router.post('/reports', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = CreateReportSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid report data'
      });
      return;
    }

    const { description, category, severity, urgency, latitude, longitude, location_label, ai_analysis } = parseResult.data;
    const userId = req.user ? req.user.id : null;

    const result = await query(
      `INSERT INTO emergency_reports
        (user_id, description, category, severity, urgency, latitude, longitude, location_label, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        description,
        category,
        severity,
        urgency,
        latitude,
        longitude,
        location_label,
        ai_analysis ? JSON.stringify(ai_analysis) : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Emergency report logged safely',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('[Emergency Create Report Error]', err);
    res.status(500).json({ success: false, error: 'Failed to record emergency report' });
  }
});

// GET /api/emergency/history
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      `SELECT id, user_id, description, category, severity, urgency,
              latitude, longitude, location_label, ai_analysis, created_at
       FROM emergency_reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user!.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('[Emergency History Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve emergency history' });
  }
});

// DELETE /api/emergency/history/:id
router.delete('/history/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const reportId = req.params.id;
    const result = await query(
      'DELETE FROM emergency_reports WHERE id = $1 AND user_id = $2',
      [reportId, req.user!.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Report not found or unauthorized' });
      return;
    }

    res.json({ success: true, message: 'Emergency report removed from history' });
  } catch (err) {
    console.error('[Emergency Delete History Error]', err);
    res.status(500).json({ success: false, error: 'Failed to delete emergency report' });
  }
});

// DELETE /api/emergency/history
router.delete('/history', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await query('DELETE FROM emergency_reports WHERE user_id = $1', [req.user!.id]);
    res.json({ success: true, message: 'All emergency history successfully cleared' });
  } catch (err) {
    console.error('[Emergency Clear History Error]', err);
    res.status(500).json({ success: false, error: 'Failed to clear emergency history' });
  }
});

export default router;

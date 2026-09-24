import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Sparkles, PhoneCall, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { EmergencyAnalysis } from '@shared/types/index';
import { SeverityBadge } from './SeverityBadge';
import { Button } from '../ui/Button';

interface EmergencyAnalysisCardProps {
  analysis: EmergencyAnalysis;
  onScrollToServices?: () => void;
}

export const EmergencyAnalysisCard: React.FC<EmergencyAnalysisCardProps> = ({
  analysis,
  onScrollToServices,
}) => {
  const isCritical = analysis.severity === 'critical' || analysis.severity === 'high' || analysis.requiresEmergencyContact;

  return (
    <div className={`rounded-3xl border transition-all overflow-hidden shadow-lg ${
      isCritical
        ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20'
        : 'bg-white border-slate-200'
    }`}>
      {/* Top Banner for Critical Situations */}
      {analysis.requiresEmergencyContact && (
        <div className="bg-rose-600 text-white px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-base sm:text-lg">Immediate Official Emergency Contact Advised</h4>
              <p className="text-xs sm:text-sm text-rose-100">
                This situation may be time-critical. Please call your local official emergency number immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:911" className="inline-block">
              <Button variant="secondary" size="sm" className="bg-white text-rose-700 hover:bg-rose-50 font-bold border-none">
                Call 911 (US/CA)
              </Button>
            </a>
            <a href="tel:112" className="inline-block">
              <Button variant="secondary" size="sm" className="bg-white text-rose-700 hover:bg-rose-50 font-bold border-none">
                Call 112 (EU/IN)
              </Button>
            </a>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-6">
        {/* Category & Status header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
              Emergency Classification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize flex items-center gap-2 mt-1">
              {analysis.category} Emergency
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={analysis.severity} size="md" />
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900 text-white">
              Urgency: {analysis.urgency}
            </span>
            {analysis.isAiFallback ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200" title="Deterministic Safety Fallback Engine">
                Heuristic Engine
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Verified
              </span>
            )}
          </div>
        </div>

        {/* Safety Guidance */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>AI Safety Guidance & Precautions</span>
          </div>
          <p className="text-sm text-amber-900/90 leading-relaxed font-medium">
            {analysis.safetyGuidance}
          </p>
        </div>

        {/* Recommended Resource Types */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">
            Recommended Emergency Resources
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedResourceTypes.map((type, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm font-semibold capitalize flex items-center gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation jump */}
        {onScrollToServices && (
          <div className="pt-2 flex justify-end">
            <Button
              variant="emergency"
              onClick={onScrollToServices}
              className="gap-2 text-sm font-bold"
            >
              <span>View Matched Services Below</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  MapPin,
  Compass,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  Phone,
  RotateCcw,
  CheckCircle2,
  BookmarkPlus
} from 'lucide-react';
import type { EmergencyAnalysis, EmergencyCategory, EmergencyResource } from '@shared/types/index';
import { api } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from '../components/ui/Button';
import { EmergencyAnalysisCard } from '../components/emergency/EmergencyAnalysisCard';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ErrorState } from '../components/ui/ErrorState';

const CATEGORIES: { label: string; value: EmergencyCategory }[] = [
  { label: 'Auto-Detect (AI)', value: 'general' },
  { label: 'Medical Emergency', value: 'medical' },
  { label: 'Accident / Collision', value: 'accident' },
  { label: 'Ambulance Required', value: 'ambulance' },
  { label: 'Pharmacy / Medicine', value: 'pharmacy' },
  { label: 'Blood Requirement', value: 'blood' },
  { label: 'Fire Emergency', value: 'fire' },
  { label: 'Police / Safety Threat', value: 'police' },
];

const PRESETS = [
  'My father has severe chest pain and difficulty breathing.',
  'There was a bike accident and a person is bleeding profusely.',
  'Kitchen grease fire spreading quickly to upper cabinets.',
  'Need urgent O-negative blood donor units for emergency surgery.',
  'Need 24-hour pharmacy for urgent child antibiotic prescription.'
];

export const EmergencyPage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EmergencyCategory>('general');
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmergencyAnalysis | null>(null);
  const [matchedResources, setMatchedResources] = useState<EmergencyResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);

  const geo = useGeolocation();
  const servicesRef = useRef<HTMLDivElement>(null);

  const handleUseLocation = () => {
    geo.requestLocation();
  };

  const handlePresetClick = (presetText: string) => {
    setDescription(presetText);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 5) {
      setError('Please describe the emergency situation in at least 5 characters.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setReportSaved(false);

    try {
      const res = await api.emergency.analyze({
        description: description.trim(),
        category: category !== 'general' ? category : undefined,
        latitude: geo.latitude,
        longitude: geo.longitude,
        manualLocation: manualLocationInput.trim() || undefined,
      });

      setAnalysisResult(res.analysis);
      setMatchedResources(res.resources || []);

      // Auto-save emergency report to database
      try {
        await api.emergency.createReport({
          description: description.trim(),
          category: res.analysis.category,
          severity: res.analysis.severity,
          urgency: res.analysis.urgency,
          latitude: geo.latitude,
          longitude: geo.longitude,
          location_label: manualLocationInput.trim() || (geo.latitude ? `GPS: ${geo.latitude.toFixed(4)}, ${geo.longitude?.toFixed(4)}` : null),
          ai_analysis: res.analysis,
        });
        setReportSaved(true);
      } catch (saveErr) {
        console.warn('Report could not be saved to history:', saveErr);
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze emergency. Please check your network or call emergency services.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setCategory('general');
    setAnalysisResult(null);
    setMatchedResources([]);
    setError(null);
    setReportSaved(false);
  };

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          AI Emergency Classifier
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Describe the Emergency Situation
        </h1>
        <p className="text-slate-600 text-base max-w-2xl">
          Enter what is happening. Our AI will classify the severity, provide immediate safety guidance, and pinpoint the most appropriate nearby emergency resources.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleAnalyze} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="description" className="block text-sm font-bold text-slate-900">
              What happened? <span className="text-rose-600">*</span>
            </label>
            <span className="text-xs text-slate-400">Be as specific as possible</span>
          </div>

          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. My father has chest pain and difficulty breathing, or There was a bike accident and a person is bleeding..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 text-base focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all placeholder:text-slate-400"
            required
            minLength={5}
            maxLength={2000}
          />

          {/* Quick presets */}
          <div className="pt-1">
            <span className="text-xs text-slate-500 font-medium block mb-2">Example emergencies:</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="text-xs text-left px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors border border-slate-200/60"
                >
                  &ldquo;{preset.slice(0, 38)}...&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Selector & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-bold text-slate-900">
              Emergency Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Geolocation & Manual input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Your Current Location
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={geo.latitude ? 'secondary' : 'outline'}
                onClick={handleUseLocation}
                isLoading={geo.loading}
                className="gap-2 text-xs sm:text-sm shrink-0"
              >
                <Compass className={`w-4 h-4 ${geo.latitude ? 'text-emerald-600' : 'text-slate-500'}`} />
                {geo.latitude ? 'GPS Detected' : 'Use My GPS'}
              </Button>

              <input
                type="text"
                placeholder="Or type city, zip, or landmark"
                value={manualLocationInput}
                onChange={(e) => setManualLocationInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
              />
            </div>

            {/* Geolocation status message */}
            {geo.error && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {geo.error}
              </p>
            )}
            {geo.latitude && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Location coordinates captured ({geo.latitude.toFixed(4)}, {geo.longitude?.toFixed(4)})
              </p>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            AI analysis runs securely via Google Gemini. Official emergency numbers are always reachable.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {analysisResult && (
              <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            )}
            <Button
              type="submit"
              variant="emergency"
              size="lg"
              isLoading={isAnalyzing}
              className="w-full sm:w-auto gap-2 font-bold px-8 shadow-rose-600/30"
            >
              <Send className="w-4 h-4" />
              Analyze Emergency
            </Button>
          </div>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Analysis Failed"
          message={error}
          onRetry={handleAnalyze}
          actionText="Retry Analysis"
        />
      )}

      {/* Analysis Result Section */}
      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          {reportSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Emergency report logged securely to your confidential incident history.
              </span>
            </div>
          )}

          <EmergencyAnalysisCard
            analysis={analysisResult}
            onScrollToServices={matchedResources.length > 0 ? scrollToServices : undefined}
          />

          {/* Nearby Matched Resources */}
          <div ref={servicesRef} className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Recommended Nearby Emergency Resources
                </h3>
                <p className="text-sm text-slate-600">
                  Services matched based on AI classification and your location.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                {matchedResources.length} Services Found
              </span>
            </div>

            {matchedResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedResources.map((res) => (
                  <ResourceCard key={res.id} resource={res} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-600">No immediate nearby services matched. Try searching all resources in Find Services.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

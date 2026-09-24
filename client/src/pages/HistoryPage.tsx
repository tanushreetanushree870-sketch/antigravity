import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Trash2,
  Calendar,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import type { EmergencyReport } from '@shared/types/index';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { SeverityBadge } from '../components/emergency/SeverityBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

export const HistoryPage: React.FC = () => {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.emergency.getHistory();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load emergency history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this record from your history?')) return;
    setDeletingId(id);
    try {
      await api.emergency.deleteHistoryItem(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Could not delete emergency report.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('This will permanently delete ALL recorded emergency assistance requests. Continue?')) return;
    setClearingAll(true);
    try {
      await api.emergency.clearHistory();
      setReports([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      alert('Could not clear history.');
    } finally {
      setClearingAll(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving confidential emergency history..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-rose-600" />
            Emergency Request History
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Your past incident descriptions, AI classifications, and safety advice records.
          </p>
        </div>

        {reports.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            isLoading={clearingAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 gap-2 shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete All History
          </Button>
        )}
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-slate-400" />}
          title="No Incident History"
          description="You haven't submitted any emergency assistance requests yet."
          actionText="Analyze an Emergency"
          onAction={() => window.location.href = '/emergency'}
        />
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 relative"
            >
              {/* Top metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-md bg-slate-100 text-slate-800">
                    {report.category} Emergency
                  </span>
                  <SeverityBadge severity={report.severity} size="sm" />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    Urgency: {report.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(report.id)}
                    disabled={deletingId === report.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete this record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-1">Incident Description</h4>
                <p className="text-base text-slate-800 font-medium leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  &ldquo;{report.description}&rdquo;
                </p>
              </div>

              {/* AI Guidance and Resources */}
              {report.ai_analysis && (
                <div className="space-y-3 pt-2">
                  {report.ai_analysis.safetyGuidance && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                      <strong>AI Safety Guidance:</strong> {report.ai_analysis.safetyGuidance}
                    </div>
                  )}

                  {report.ai_analysis.recommendedResourceTypes && report.ai_analysis.recommendedResourceTypes.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Recommended Help
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.ai_analysis.recommendedResourceTypes.map((type, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold capitalize">
                            {type.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location Tag */}
              {report.location_label && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logged Location: {report.location_label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Compass, RotateCcw, AlertTriangle, Building2 } from 'lucide-react';
import type { EmergencyResource, ResourceType } from '@shared/types/index';
import { api } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Emergency Categories', value: 'all' },
  { label: 'Hospitals & Trauma', value: 'hospital' },
  { label: 'Emergency Departments', value: 'emergency_department' },
  { label: 'Ambulance & Paramedics', value: 'ambulance' },
  { label: '24-Hour Pharmacies', value: 'pharmacy' },
  { label: 'Blood & Plasma Banks', value: 'blood_bank' },
  { label: 'Fire & Rescue Stations', value: 'fire_station' },
  { label: 'Police Stations', value: 'police_station' },
];

const RADIUS_OPTIONS = [
  { label: '5 km radius', value: 5 },
  { label: '15 km radius', value: 15 },
  { label: '30 km radius', value: 30 },
  { label: '50 km radius', value: 50 },
  { label: '100 km radius', value: 100 },
];

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState(30);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const geo = useGeolocation();

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.resources.search({
        query: query.trim(),
        category: category !== 'all' ? category : undefined,
        latitude: geo.latitude ?? undefined,
        longitude: geo.longitude ?? undefined,
        radius_km: radiusKm,
        limit: 40,
      });
      setResources(data);
    } catch (err: any) {
      console.error('Failed to load resources:', err);
      setError(err.message || 'Unable to load emergency resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [category, radiusKm, geo.latitude, geo.longitude]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResources();
  };

  const handleQuickSearch = (keyword: string) => {
    setQuery(keyword);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Info */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Emergency Services
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl">
          Search for nearby hospitals, ambulances, 24-hour pharmacies, blood banks, police, and fire stations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, address, or keyword (e.g. 'nearest hospital', '24 hour pharmacy')..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="gap-2 px-6">
            <Search className="w-4 h-4" />
            Search Services
          </Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium">Quick searches:</span>
          {['nearest hospital', '24 hour pharmacy', 'ambulance', 'blood bank', 'police station', 'fire station'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                api.resources.search({
                  query: tag,
                  category: category !== 'all' ? category : undefined,
                  latitude: geo.latitude ?? undefined,
                  longitude: geo.longitude ?? undefined,
                  radius_km: radiusKm,
                }).then(setResources);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors font-medium border border-slate-200/60"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Secondary filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Service Type</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSearchParams(e.target.value !== 'all' ? { category: e.target.value } : {});
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Search Distance</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Location Precision</label>
            <Button
              type="button"
              variant={geo.latitude ? 'secondary' : 'outline'}
              size="sm"
              onClick={geo.requestLocation}
              isLoading={geo.loading}
              className="w-full justify-between h-[38px] text-xs font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Compass className={`w-4 h-4 ${geo.latitude ? 'text-emerald-600' : 'text-slate-400'}`} />
                {geo.latitude ? `GPS Active` : 'Enable GPS'}
              </span>
              {geo.latitude && <span className="text-[10px] text-emerald-700 font-bold">Accurate</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Available Emergency Resources ({resources.length})
        </h2>
        {geo.latitude && (
          <span className="text-xs text-slate-500 font-medium">
            Sorted by nearest distance
          </span>
        )}
      </div>

      {/* Loading, Error, Empty, or Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching verified emergency resources..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadResources} />
      ) : resources.length === 0 ? (
        <EmptyState
          title="No Emergency Resources Found"
          description="We couldn't find any resources matching your search and distance filters. Try broadening your category or radius."
          actionText="Reset Filters"
          onAction={() => {
            setQuery('');
            setCategory('all');
            setRadiusKm(50);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Heart,
  History,
  Building2,
  Ambulance,
  Pill,
  Droplet,
  Flame,
  Shield,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink
} from 'lucide-react';
import type { EmergencyReport, EmergencyResource } from '@shared/types/index';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { ResourceCard } from '../components/resources/ResourceCard';
import { SeverityBadge } from '../components/emergency/SeverityBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const geo = useGeolocation();

  const [recentReports, setRecentReports] = useState<EmergencyReport[]>([]);
  const [favorites, setFavorites] = useState<EmergencyResource[]>([]);
  const [nearbyResources, setNearbyResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [reportsData, favsData] = await Promise.all([
          api.emergency.getHistory().catch(() => []),
          api.favorites.getAll().catch(() => []),
        ]);
        setRecentReports(reportsData.slice(0, 3));
        setFavorites(favsData.slice(0, 4));

        // Load some nearby resources
        const nearby = await api.resources.search({
          limit: 4,
          latitude: geo.latitude ?? undefined,
          longitude: geo.longitude ?? undefined,
        }).catch(() => []);
        setNearbyResources(nearby);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [geo.latitude, geo.longitude]);

  if (loading) {
    return <LoadingSpinner message="Preparing your emergency dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome & Quick Help Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">
            Emergency Readiness Center
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Quickly initiate emergency AI classification or access your saved regional response contacts.
          </p>
        </div>

        {/* Highly Visible Emergency Action Button */}
        <Link to="/emergency" className="shrink-0 w-full sm:w-auto">
          <Button
            variant="emergency"
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg font-black gap-3 px-8 shadow-rose-600/40"
          >
            <PhoneCall className="w-6 h-6 animate-pulse" />
            Quick Emergency Help
          </Button>
        </Link>
      </div>

      {/* Emergency Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Direct Emergency Services
          </h2>
          <Link to="/services" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Hospitals', type: 'hospital', icon: Building2, color: 'text-rose-600 bg-rose-50' },
            { name: 'Ambulance', type: 'ambulance', icon: Ambulance, color: 'text-amber-600 bg-amber-50' },
            { name: 'Pharmacies', type: 'pharmacy', icon: Pill, color: 'text-emerald-600 bg-emerald-50' },
            { name: 'Blood Bank', type: 'blood_bank', icon: Droplet, color: 'text-red-600 bg-red-50' },
            { name: 'Fire Station', type: 'fire_station', icon: Flame, color: 'text-orange-600 bg-orange-50' },
            { name: 'Police', type: 'police_station', icon: Shield, color: 'text-blue-600 bg-blue-50' },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.type}
                to={`/services?category=${cat.type}`}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 text-center transition-all hover:shadow-sm group flex flex-col items-center justify-center gap-2"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${cat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Emergency Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Recent Emergency Analyses
            </h2>
            <Link to="/history" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
              View full history
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {report.category}
                    </span>
                    <SeverityBadge severity={report.severity} size="sm" />
                  </div>
                  <p className="text-sm text-slate-800 font-medium line-clamp-2">
                    &ldquo;{report.description}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {report.location_label && (
                      <span className="truncate max-w-[150px]">{report.location_label}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              <p>No recent emergency requests on record.</p>
              <Link to="/emergency" className="text-rose-600 font-semibold hover:underline mt-2 inline-block">
                Start an emergency analysis
              </Link>
            </div>
          )}
        </div>

        {/* Favorite Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              Saved Emergency Resources
            </h2>
            <Link to="/favorites" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
              Manage saved ({favorites.length})
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onFavoriteToggle={(id, isFav) => {
                    if (!isFav) setFavorites(prev => prev.filter(f => f.id !== id));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              <p>You haven&apos;t saved any emergency resources yet.</p>
              <Link to="/services" className="text-rose-600 font-semibold hover:underline mt-2 inline-block">
                Explore services to save favorites
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Resources Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Emergency Services in Your Area
          </h2>
          <Link to="/services" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
            Search all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </div>
    </div>
  );
};

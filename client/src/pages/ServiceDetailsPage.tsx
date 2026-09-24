import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Navigation,
  Heart,
  Globe,
  Clock,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  Share2
} from 'lucide-react';
import type { EmergencyResource } from '@shared/types/index';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';

export const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const geo = useGeolocation();

  const [resource, setResource] = useState<EmergencyResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.resources.getById(id);
        setResource(data);
        setIsFavorite(data.is_favorite || false);
      } catch (err: any) {
        setError(err.message || 'Resource not found');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please log in to save emergency resources.');
      return;
    }
    if (!resource) return;

    setFavLoading(true);
    try {
      if (isFavorite) {
        await api.favorites.remove(resource.id);
        setIsFavorite(false);
      } else {
        await api.favorites.add(resource.id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading emergency resource details..." />;
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <ErrorState
          title="Service Not Found"
          message={error || 'The requested emergency service could not be located.'}
          actionText="Back to Services"
          onRetry={() => navigate('/services')}
        />
      </div>
    );
  }

  const directionsUrl = resource.latitude && resource.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resource.name} ${resource.address || ''}`)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Services Directory
      </Link>

      {/* Main Details Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-md bg-rose-50 text-rose-700">
                {resource.resource_type.replace(/_/g, ' ')}
              </span>
              {resource.source && (
                <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {resource.source}
                </span>
              )}
              {resource.emergency_available && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Emergency Service
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {resource.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              disabled={favLoading}
              className={`p-3 rounded-2xl border transition-colors ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-rose-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Call to Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resource.phone ? (
            <a href={`tel:${resource.phone}`} className="block">
              <Button variant="emergency" size="lg" className="w-full gap-3 font-bold text-base shadow-rose-600/25">
                <Phone className="w-5 h-5" />
                Call ({resource.phone})
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="lg" disabled className="w-full text-slate-400">
              No Direct Phone Registered
            </Button>
          )}

          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" size="lg" className="w-full gap-3 font-bold text-base text-slate-800 hover:text-blue-600 hover:border-blue-400">
              <Navigation className="w-5 h-5 text-blue-600" />
              Get Directions (Google Maps)
            </Button>
          </a>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Address */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              Physical Address
            </span>
            <p className="text-base font-bold text-slate-800">
              {resource.address || 'Address not listed'}
            </p>
            {resource.latitude && resource.longitude && (
              <p className="text-xs text-slate-500 pt-1">
                GPS Coordinates: {resource.latitude.toFixed(4)}, {resource.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Opening Hours */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Operating Hours
            </span>
            <p className="text-base font-bold text-slate-800">
              {resource.opening_hours
                ? typeof resource.opening_hours === 'object'
                  ? Object.entries(resource.opening_hours).map(([day, hr]) => `${day.replace(/_/g, ' ')}: ${hr}`).join(', ')
                  : String(resource.opening_hours)
                : '24 Hours / Emergency Dispatch'}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Always call ahead to confirm specialized trauma unit readiness.
            </p>
          </div>

          {/* Website */}
          {resource.website && (
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-500" />
                Official Website
              </span>
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 hover:underline block break-all"
              >
                {resource.website}
              </a>
            </div>
          )}

          {/* Verification Status */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs uppercase font-extrabold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Verification Status
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {resource.verified_at ? `Verified on ${new Date(resource.verified_at).toLocaleDateString()}` : 'System Registered Service'}
            </p>
            <p className="text-xs text-slate-500">
              Data Source: {resource.source || 'EmergencyAssist AI Registry'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

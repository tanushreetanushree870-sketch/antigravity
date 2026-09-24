import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Navigation, Heart, Clock, MapPin, Building2, ExternalLink, ShieldCheck } from 'lucide-react';
import type { EmergencyResource } from '@shared/types/index';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ResourceCardProps {
  resource: EmergencyResource;
  onFavoriteToggle?: (resourceId: string, isFav: boolean) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onFavoriteToggle }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(resource.is_favorite || false);
  const [favLoading, setFavLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save emergency resources to your favorites.');
      return;
    }

    setFavLoading(true);
    try {
      if (isFavorite) {
        await api.favorites.remove(resource.id);
        setIsFavorite(false);
        onFavoriteToggle?.(resource.id, false);
      } else {
        await api.favorites.add(resource.id);
        setIsFavorite(true);
        onFavoriteToggle?.(resource.id, true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  // Google Maps directions URL
  const directionsUrl = resource.latitude && resource.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resource.name} ${resource.address || ''}`)}`;

  const formatResourceType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Type, Distance, Favorite */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {formatResourceType(resource.resource_type)}
            </span>

            {resource.distance_km !== undefined && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {resource.distance_km} km away
              </span>
            )}

            {resource.source && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {resource.source}
              </span>
            )}
          </div>

          <button
            onClick={handleFavoriteClick}
            disabled={favLoading}
            aria-label="Save to favorites"
            className={`p-2 rounded-xl transition-colors ${
              isFavorite
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Resource Name */}
        <Link to={`/services/${resource.id}`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 mb-2">
            {resource.name}
          </h3>
        </Link>

        {/* Address & Hours */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          {resource.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{resource.address}</span>
            </div>
          )}

          {resource.opening_hours && (
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{typeof resource.opening_hours === 'object' ? Object.values(resource.opening_hours)[0] : '24/7 Service'}</span>
            </div>
          )}

          {resource.emergency_available && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified 24/7 Emergency Readiness</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Call & Directions */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        {resource.phone ? (
          <a
            href={`tel:${resource.phone}`}
            className="flex-1"
            title={`Call ${resource.name}`}
          >
            <Button
              variant="emergency"
              size="sm"
              className="w-full gap-2 font-bold shadow-none hover:shadow"
            >
              <Phone className="w-4 h-4" />
              Call Service
            </Button>
          </a>
        ) : (
          <Button variant="outline" size="sm" disabled className="flex-1 text-slate-400">
            No Phone
          </Button>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          title="Get Directions on Google Maps"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            Directions
          </Button>
        </a>

        <Link to={`/services/${resource.id}`}>
          <button
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            title="View Details"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowRight } from 'lucide-react';
import type { EmergencyResource } from '@shared/types/index';
import { api } from '../services/api';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.favorites.getAll();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load favorite resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (resourceId: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(r => r.id !== resourceId));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your saved emergency resources..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchFavorites} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          Saved Emergency Resources
        </h1>
        <p className="text-slate-600 text-sm">
          Quickly access your pinned trauma centers, 24/7 pharmacies, fire departments, and ambulance services.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-300" />}
          title="No Saved Resources Yet"
          description="Click the heart icon on any emergency resource card to bookmark it for rapid access during crises."
          actionText="Find Emergency Services"
          onAction={() => window.location.href = '/services'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

import type {
  EmergencyAnalysis,
  EmergencyCategory,
  EmergencyReport,
  EmergencyResource,
  UserProfile
} from '@shared/types/index';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('ea_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('ea_token', token);
  } else {
    localStorage.removeItem('ea_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  auth: {
    async register(payload: { full_name: string; email: string; password: string; phone?: string | null }) {
      const res = await request<{ token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    },
    async login(payload: { email: string; password: string }) {
      const res = await request<{ token: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.token) setAuthToken(res.token);
      return res;
    },
    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setAuthToken(null);
      }
    },
    async me(): Promise<UserProfile | null> {
      try {
        return await request<UserProfile>('/auth/me');
      } catch {
        return null;
      }
    },
  },

  emergency: {
    async analyze(payload: {
      description: string;
      category?: EmergencyCategory;
      latitude?: number | null;
      longitude?: number | null;
      manualLocation?: string | null;
    }) {
      return await request<{
        analysis: EmergencyAnalysis;
        resources: EmergencyResource[];
      }>('/emergency/analyze', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async createReport(payload: {
      description: string;
      category: EmergencyCategory;
      severity?: string;
      urgency?: string;
      latitude?: number | null;
      longitude?: number | null;
      location_label?: string | null;
      ai_analysis?: EmergencyAnalysis | null;
    }): Promise<EmergencyReport> {
      return await request<EmergencyReport>('/emergency/reports', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getHistory(): Promise<EmergencyReport[]> {
      return await request<EmergencyReport[]>('/emergency/history');
    },

    async deleteHistoryItem(id: string): Promise<void> {
      await request(`/emergency/history/${id}`, { method: 'DELETE' });
    },

    async clearHistory(): Promise<void> {
      await request('/emergency/history', { method: 'DELETE' });
    },
  },

  resources: {
    async getNearby(params: {
      latitude: number;
      longitude: number;
      category?: string;
      radius_km?: number;
      limit?: number;
    }): Promise<EmergencyResource[]> {
      const sp = new URLSearchParams();
      sp.set('latitude', params.latitude.toString());
      sp.set('longitude', params.longitude.toString());
      if (params.category) sp.set('category', params.category);
      if (params.radius_km) sp.set('radius_km', params.radius_km.toString());
      if (params.limit) sp.set('limit', params.limit.toString());

      return await request<EmergencyResource[]>(`/resources/nearby?${sp.toString()}`);
    },

    async search(params: {
      query?: string;
      category?: string;
      latitude?: number;
      longitude?: number;
      radius_km?: number;
      limit?: number;
    }): Promise<EmergencyResource[]> {
      const sp = new URLSearchParams();
      if (params.query) sp.set('query', params.query);
      if (params.category) sp.set('category', params.category);
      if (params.latitude != null) sp.set('latitude', params.latitude.toString());
      if (params.longitude != null) sp.set('longitude', params.longitude.toString());
      if (params.radius_km) sp.set('radius_km', params.radius_km.toString());
      if (params.limit) sp.set('limit', params.limit.toString());

      return await request<EmergencyResource[]>(`/resources/search?${sp.toString()}`);
    },

    async getById(id: string): Promise<EmergencyResource> {
      return await request<EmergencyResource>(`/resources/${id}`);
    },
  },

  favorites: {
    async getAll(): Promise<EmergencyResource[]> {
      return await request<EmergencyResource[]>('/favorites');
    },

    async add(resourceId: string): Promise<void> {
      await request('/favorites', {
        method: 'POST',
        body: JSON.stringify({ resource_id: resourceId }),
      });
    },

    async remove(resourceId: string): Promise<void> {
      await request(`/favorites/${resourceId}`, { method: 'DELETE' });
    },
  },

  profile: {
    async get(): Promise<{ profile: UserProfile; stats: { totalReports: number; totalFavorites: number } }> {
      return await request('/profile');
    },

    async update(data: { full_name?: string; phone?: string | null }): Promise<UserProfile> {
      return await request<UserProfile>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
};

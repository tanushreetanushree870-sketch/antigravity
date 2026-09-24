export type EmergencyCategory =
  | 'medical'
  | 'accident'
  | 'ambulance'
  | 'pharmacy'
  | 'blood'
  | 'fire'
  | 'police'
  | 'general';

export type EmergencySeverity =
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'unknown';

export type ResourceType =
  | 'hospital'
  | 'emergency_department'
  | 'pharmacy'
  | 'ambulance'
  | 'blood_bank'
  | 'police_station'
  | 'fire_station'
  | 'emergency_service';

export interface EmergencyAnalysis {
  category: EmergencyCategory;
  severity: EmergencySeverity;
  urgency: string;
  requiresEmergencyContact: boolean;
  recommendedResourceTypes: string[];
  safetyGuidance: string;
  isAiFallback?: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyReport {
  id: string;
  user_id: string | null;
  description: string;
  category: EmergencyCategory;
  severity: EmergencySeverity;
  urgency: string;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  ai_analysis: EmergencyAnalysis | null;
  created_at: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  resource_type: ResourceType;
  address: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Record<string, string> | null;
  emergency_available: boolean;
  source: string;
  verified_at: string | null;
  distance_km?: number;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
  resource?: EmergencyResource;
}

export interface EmergencySearch {
  id: string;
  user_id: string | null;
  query: string;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

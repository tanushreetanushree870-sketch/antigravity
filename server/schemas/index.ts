import { z } from 'zod';

export const EmergencyCategoryEnum = z.enum([
  'medical',
  'accident',
  'ambulance',
  'pharmacy',
  'blood',
  'fire',
  'police',
  'general'
]);

export const EmergencySeverityEnum = z.enum([
  'low',
  'moderate',
  'high',
  'critical',
  'unknown'
]);

export const ResourceTypeEnum = z.enum([
  'hospital',
  'emergency_department',
  'pharmacy',
  'ambulance',
  'blood_bank',
  'police_station',
  'fire_station',
  'emergency_service'
]);

export const EmergencyRequestSchema = z.object({
  description: z.string().min(5, 'Please provide at least 5 characters describing the situation').max(2000),
  category: EmergencyCategoryEnum.optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  manualLocation: z.string().max(300).optional().nullable()
});

export const EmergencyAnalysisSchema = z.object({
  category: EmergencyCategoryEnum,
  severity: EmergencySeverityEnum,
  urgency: z.string(),
  requiresEmergencyContact: z.boolean(),
  recommendedResourceTypes: z.array(z.string()),
  safetyGuidance: z.string(),
  isAiFallback: z.boolean().optional()
});

export const CreateReportSchema = z.object({
  description: z.string().min(5).max(2000),
  category: EmergencyCategoryEnum,
  severity: EmergencySeverityEnum.optional().default('unknown'),
  urgency: z.string().optional().default('standard'),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  location_label: z.string().max(300).optional().nullable(),
  ai_analysis: EmergencyAnalysisSchema.optional().nullable()
});

export const RegisterSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  phone: z.string().max(25).optional().nullable()
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(25).optional().nullable()
});

export const AddFavoriteSchema = z.object({
  resource_id: z.string().uuid('Invalid resource ID')
});

export const SearchResourcesSchema = z.object({
  query: z.string().max(200).optional().default(''),
  category: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius_km: z.coerce.number().min(1).max(200).optional().default(50),
  limit: z.coerce.number().min(1).max(100).optional().default(30)
});

export const NearbyResourcesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  category: z.string().optional(),
  radius_km: z.coerce.number().min(1).max(200).optional().default(30),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
});

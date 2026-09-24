import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pool: pg.Pool | null = null;
let useFallbackStore = false;

// In-memory persistent store for development when PostgreSQL is not configured
interface MemoryStore {
  profiles: any[];
  emergency_reports: any[];
  emergency_resources: any[];
  favorites: any[];
  emergency_searches: any[];
}

const memoryStore: MemoryStore = {
  profiles: [],
  emergency_reports: [],
  emergency_resources: [],
  favorites: [],
  emergency_searches: []
};

// Calculate Haversine distance in kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Initialize Database Connection and run schema migrations
 */
export async function initDb(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      console.log('[DB] Connecting to PostgreSQL database...');
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pool.connect();
      console.log('[DB] Successfully connected to PostgreSQL.');
      client.release();

      // Read and execute schema
      const schemaPath = path.resolve(process.cwd(), 'server/db/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('[DB] Schema verified and applied to PostgreSQL.');
      }
      useFallbackStore = false;
      return;
    } catch (err) {
      console.warn('[DB] Could not connect to PostgreSQL at DATABASE_URL:', (err as Error).message);
      console.log('[DB] Falling back to built-in emergency local datastore for zero downtime.');
      useFallbackStore = true;
    }
  } else {
    console.log('[DB] No DATABASE_URL provided. Operating with built-in emergency local datastore.');
    useFallbackStore = true;
  }
}

/**
 * Universal Query function compatible with PostgreSQL & local store
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  if (!useFallbackStore && pool) {
    try {
      const res = await pool.query(text, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rowCount ?? res.rows.length
      };
    } catch (err) {
      console.error('[DB Query Error]', (err as Error).message, 'SQL:', text);
      throw err;
    }
  }

  // Fallback In-Memory Engine executing core patterns
  return executeInMemoryQuery<T>(text, params);
}

function executeInMemoryQuery<T>(sql: string, params: any[]): QueryResult<T> {
  const trimmed = sql.trim();
  const lower = trimmed.toLowerCase();

  // Handle PROFILES
  if (lower.startsWith('insert into profiles')) {
    // INSERT INTO profiles (id, full_name, email, phone, password_hash) VALUES (...) RETURNING *
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newProfile = {
      id,
      full_name: params[0] || 'User',
      email: params[1],
      phone: params[2] || null,
      password_hash: params[3],
      created_at: now,
      updated_at: now
    };
    memoryStore.profiles.push(newProfile);
    return { rows: [newProfile as unknown as T], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from profiles')) {
    if (lower.includes('where email =')) {
      const email = params[0]?.toLowerCase();
      const match = memoryStore.profiles.find(p => p.email?.toLowerCase() === email);
      return { rows: match ? [match as unknown as T] : [], rowCount: match ? 1 : 0 };
    }
    if (lower.includes('where id =')) {
      const id = params[0];
      const match = memoryStore.profiles.find(p => p.id === id);
      return { rows: match ? [match as unknown as T] : [], rowCount: match ? 1 : 0 };
    }
    return { rows: [...memoryStore.profiles] as unknown as T[], rowCount: memoryStore.profiles.length };
  }

  if (lower.startsWith('update profiles')) {
    const id = params[params.length - 1];
    const profile = memoryStore.profiles.find(p => p.id === id);
    if (profile) {
      if (params[0] !== undefined) profile.full_name = params[0];
      if (params[1] !== undefined) profile.phone = params[1];
      profile.updated_at = new Date().toISOString();
      return { rows: [profile as unknown as T], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Handle EMERGENCY REPORTS
  if (lower.startsWith('insert into emergency_reports')) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const report = {
      id,
      user_id: params[0] || null,
      description: params[1],
      category: params[2],
      severity: params[3] || 'unknown',
      urgency: params[4] || 'standard',
      latitude: params[5] ?? null,
      longitude: params[6] ?? null,
      location_label: params[7] || null,
      ai_analysis: typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8],
      created_at: now
    };
    memoryStore.emergency_reports.unshift(report);
    return { rows: [report as unknown as T], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from emergency_reports')) {
    if (lower.includes('where user_id =')) {
      const userId = params[0];
      const reports = memoryStore.emergency_reports
        .filter(r => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { rows: reports as unknown as T[], rowCount: reports.length };
    }
    return { rows: [...memoryStore.emergency_reports] as unknown as T[], rowCount: memoryStore.emergency_reports.length };
  }

  if (lower.startsWith('delete from emergency_reports')) {
    if (lower.includes('where id =') && lower.includes('and user_id =')) {
      const id = params[0];
      const userId = params[1];
      const initialLen = memoryStore.emergency_reports.length;
      memoryStore.emergency_reports = memoryStore.emergency_reports.filter(r => !(r.id === id && r.user_id === userId));
      const deleted = initialLen - memoryStore.emergency_reports.length;
      return { rows: [], rowCount: deleted };
    }
    if (lower.includes('where user_id =')) {
      const userId = params[0];
      const initialLen = memoryStore.emergency_reports.length;
      memoryStore.emergency_reports = memoryStore.emergency_reports.filter(r => r.user_id !== userId);
      const deleted = initialLen - memoryStore.emergency_reports.length;
      return { rows: [], rowCount: deleted };
    }
  }

  // Handle EMERGENCY RESOURCES
  if (lower.startsWith('insert into emergency_resources')) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const resource = {
      id,
      name: params[0],
      resource_type: params[1],
      address: params[2] || null,
      phone: params[3] || null,
      website: params[4] || null,
      latitude: params[5] !== undefined ? Number(params[5]) : null,
      longitude: params[6] !== undefined ? Number(params[6]) : null,
      opening_hours: typeof params[7] === 'string' ? JSON.parse(params[7]) : params[7] || null,
      emergency_available: params[8] === true,
      source: params[9] || 'Demo Data',
      verified_at: params[10] || null,
      created_at: now,
      updated_at: now
    };
    memoryStore.emergency_resources.push(resource);
    return { rows: [resource as unknown as T], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from emergency_resources')) {
    if (lower.includes('where id =')) {
      const id = params[0];
      const resource = memoryStore.emergency_resources.find(r => r.id === id);
      return { rows: resource ? [resource as unknown as T] : [], rowCount: resource ? 1 : 0 };
    }
    return { rows: [...memoryStore.emergency_resources] as unknown as T[], rowCount: memoryStore.emergency_resources.length };
  }

  // Handle FAVORITES
  if (lower.startsWith('insert into favorites')) {
    const id = crypto.randomUUID();
    const userId = params[0];
    const resourceId = params[1];
    const existing = memoryStore.favorites.find(f => f.user_id === userId && f.resource_id === resourceId);
    if (existing) {
      return { rows: [existing as unknown as T], rowCount: 1 };
    }
    const fav = {
      id,
      user_id: userId,
      resource_id: resourceId,
      created_at: new Date().toISOString()
    };
    memoryStore.favorites.push(fav);
    return { rows: [fav as unknown as T], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from favorites')) {
    if (lower.includes('where user_id =')) {
      const userId = params[0];
      const favs = memoryStore.favorites.filter(f => f.user_id === userId);
      // Join with emergency_resources
      const joined = favs.map(f => {
        const res = memoryStore.emergency_resources.find(r => r.id === f.resource_id);
        return {
          id: f.id,
          user_id: f.user_id,
          resource_id: f.resource_id,
          created_at: f.created_at,
          ...res
        };
      });
      return { rows: joined as unknown as T[], rowCount: joined.length };
    }
  }

  if (lower.startsWith('delete from favorites')) {
    const userId = params[0];
    const resourceId = params[1];
    const initialLen = memoryStore.favorites.length;
    memoryStore.favorites = memoryStore.favorites.filter(f => !(f.user_id === userId && f.resource_id === resourceId));
    return { rows: [], rowCount: initialLen - memoryStore.favorites.length };
  }

  // Handle EMERGENCY SEARCHES
  if (lower.startsWith('insert into emergency_searches')) {
    const id = crypto.randomUUID();
    const search = {
      id,
      user_id: params[0] || null,
      query: params[1],
      category: params[2] || null,
      latitude: params[3] || null,
      longitude: params[4] || null,
      created_at: new Date().toISOString()
    };
    memoryStore.emergency_searches.unshift(search);
    return { rows: [search as unknown as T], rowCount: 1 };
  }

  if (lower.startsWith('select') && lower.includes('from emergency_searches')) {
    if (lower.includes('where user_id =')) {
      const userId = params[0];
      const searches = memoryStore.emergency_searches.filter(s => s.user_id === userId).slice(0, 10);
      return { rows: searches as unknown as T[], rowCount: searches.length };
    }
  }

  return { rows: [], rowCount: 0 };
}

export function isUsingFallbackStore(): boolean {
  return useFallbackStore;
}

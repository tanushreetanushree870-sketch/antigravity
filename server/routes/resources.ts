import { Router } from 'express';
import { SearchResourcesSchema, NearbyResourcesSchema } from '../schemas/index.js';
import { query, calculateHaversineDistance } from '../db/index.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import type { EmergencyResource } from '../../shared/types/index.js';

const router = Router();

// GET /api/resources/nearby
router.get('/nearby', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = NearbyResourcesSchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid coordinates supplied'
      });
      return;
    }

    const { latitude, longitude, category, radius_km, limit } = parseResult.data;

    const allRes = await query<EmergencyResource>('SELECT * FROM emergency_resources');
    let resources = allRes.rows;

    // Filter by category if given
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      resources = resources.filter(r =>
        r.resource_type.toLowerCase() === catLower ||
        r.resource_type.toLowerCase().includes(catLower)
      );
    }

    // Compute distance
    let withDistance = resources.map(r => {
      let distance_km = 0;
      if (r.latitude != null && r.longitude != null) {
        distance_km = calculateHaversineDistance(latitude, longitude, r.latitude, r.longitude);
      }
      return {
        ...r,
        distance_km
      };
    });

    // Filter within radius if distance applies
    if (radius_km) {
      withDistance = withDistance.filter(r => r.distance_km <= radius_km);
    }

    // Sort ascending by distance
    withDistance.sort((a, b) => a.distance_km - b.distance_km);

    // Limit
    const sliced = withDistance.slice(0, limit);

    // Check favorites if logged in
    if (req.user) {
      const favsRes = await query('SELECT resource_id FROM favorites WHERE user_id = $1', [req.user.id]);
      const favIds = new Set(favsRes.rows.map(f => f.resource_id));
      sliced.forEach(r => {
        r.is_favorite = favIds.has(r.id);
      });
    }

    res.json({
      success: true,
      data: sliced
    });
  } catch (err) {
    console.error('[Resources Nearby Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve nearby emergency resources' });
  }
});

// GET /api/resources/search
router.get('/search', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = SearchResourcesSchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid search parameters'
      });
      return;
    }

    const { query: searchQuery, category, latitude, longitude, radius_km, limit } = parseResult.data;

    // Record search into emergency_searches
    if (searchQuery.trim()) {
      await query(
        `INSERT INTO emergency_searches (user_id, query, category, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user ? req.user.id : null, searchQuery.trim(), category || null, latitude ?? null, longitude ?? null]
      );
    }

    const allRes = await query<EmergencyResource>('SELECT * FROM emergency_resources');
    let resources = allRes.rows;

    // Filter by text query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      resources = resources.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.resource_type.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      resources = resources.filter(r =>
        r.resource_type.toLowerCase() === catLower ||
        r.resource_type.toLowerCase().includes(catLower)
      );
    }

    // Compute distance if coordinates provided
    let mapped = resources.map(r => {
      let distance_km: number | undefined;
      if (latitude != null && longitude != null && r.latitude != null && r.longitude != null) {
        distance_km = calculateHaversineDistance(latitude, longitude, r.latitude, r.longitude);
      }
      return {
        ...r,
        distance_km
      };
    });

    if (latitude != null && longitude != null) {
      if (radius_km) {
        mapped = mapped.filter(r => r.distance_km === undefined || r.distance_km <= radius_km);
      }
      mapped.sort((a, b) => (a.distance_km ?? 99999) - (b.distance_km ?? 99999));
    }

    const sliced = mapped.slice(0, limit);

    // Check favorites
    if (req.user) {
      const favsRes = await query('SELECT resource_id FROM favorites WHERE user_id = $1', [req.user.id]);
      const favIds = new Set(favsRes.rows.map(f => f.resource_id));
      sliced.forEach(r => {
        r.is_favorite = favIds.has(r.id);
      });
    }

    res.json({
      success: true,
      data: sliced
    });
  } catch (err) {
    console.error('[Resources Search Error]', err);
    res.status(500).json({ success: false, error: 'Failed to search emergency resources' });
  }
});

// GET /api/resources/:id
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const resourceId = req.params.id;
    const result = await query<EmergencyResource>(
      'SELECT * FROM emergency_resources WHERE id = $1',
      [resourceId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Emergency resource not found' });
      return;
    }

    const resource = result.rows[0];

    // Compute favorite status
    if (req.user) {
      const favRes = await query(
        'SELECT id FROM favorites WHERE user_id = $1 AND resource_id = $2',
        [req.user.id, resourceId]
      );
      resource.is_favorite = favRes.rowCount > 0;
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (err) {
    console.error('[Resource Details Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve resource details' });
  }
});

export default router;

import { Router } from 'express';
import { AddFavoriteSchema } from '../schemas/index.js';
import { query } from '../db/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/favorites
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await query(
      `SELECT f.id as favorite_id, f.created_at as saved_at,
              r.*
       FROM favorites f
       JOIN emergency_resources r ON f.resource_id = r.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user!.id]
    );

    const resources = result.rows.map(row => ({
      ...row,
      is_favorite: true
    }));

    res.json({
      success: true,
      data: resources
    });
  } catch (err) {
    console.error('[Favorites List Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve saved favorites' });
  }
});

// POST /api/favorites
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = AddFavoriteSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Invalid resource ID'
      });
      return;
    }

    const { resource_id } = parseResult.data;

    // Check resource exists
    const resCheck = await query('SELECT id FROM emergency_resources WHERE id = $1', [resource_id]);
    if (resCheck.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Resource not found' });
      return;
    }

    const result = await query(
      `INSERT INTO favorites (user_id, resource_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, resource_id) DO NOTHING
       RETURNING *`,
      [req.user!.id, resource_id]
    );

    res.status(201).json({
      success: true,
      message: 'Resource saved to favorites',
      data: result.rows[0] || { user_id: req.user!.id, resource_id }
    });
  } catch (err) {
    console.error('[Favorites Add Error]', err);
    res.status(500).json({ success: false, error: 'Failed to save resource to favorites' });
  }
});

// DELETE /api/favorites/:resourceId
router.delete('/:resourceId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const resourceId = req.params.resourceId;
    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND resource_id = $2',
      [req.user!.id, resourceId]
    );

    res.json({
      success: true,
      message: 'Resource removed from favorites'
    });
  } catch (err) {
    console.error('[Favorites Delete Error]', err);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

export default router;

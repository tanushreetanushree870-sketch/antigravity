import { Router } from 'express';
import { UpdateProfileSchema } from '../schemas/index.js';
import { query } from '../db/index.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const profileRes = await query(
      'SELECT id, full_name, email, phone, created_at, updated_at FROM profiles WHERE id = $1',
      [req.user!.id]
    );

    if (profileRes.rowCount === 0) {
      res.status(404).json({ success: false, error: 'User profile not found' });
      return;
    }

    // Get user stats
    const reportsCountRes = await query(
      'SELECT COUNT(*) as count FROM emergency_reports WHERE user_id = $1',
      [req.user!.id]
    );
    const favsCountRes = await query(
      'SELECT COUNT(*) as count FROM favorites WHERE user_id = $1',
      [req.user!.id]
    );

    res.json({
      success: true,
      data: {
        profile: profileRes.rows[0],
        stats: {
          totalReports: parseInt(reportsCountRes.rows[0]?.count || '0', 10),
          totalFavorites: parseInt(favsCountRes.rows[0]?.count || '0', 10)
        }
      }
    });
  } catch (err) {
    console.error('[Profile Get Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
});

// PUT /api/profile
router.put('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parseResult = UpdateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.issues[0]?.message || 'Invalid profile information'
      });
      return;
    }

    const { full_name, phone } = parseResult.data;

    const updateRes = await query(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, full_name, email, phone, created_at, updated_at`,
      [full_name?.trim() || null, phone?.trim() || null, req.user!.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Profile Update Error]', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;

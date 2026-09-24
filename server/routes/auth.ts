import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { RegisterSchema, LoginSchema } from '../schemas/index.js';
import { query } from '../db/index.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid input data'
      });
      return;
    }

    const { full_name, email, password, phone } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query('SELECT id FROM profiles WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount > 0) {
      res.status(409).json({
        success: false,
        error: 'An account with this email address already exists'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user profile
    const insertResult = await query(
      `INSERT INTO profiles (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, phone, created_at, updated_at`,
      [full_name.trim(), normalizedEmail, phone?.trim() || null, passwordHash]
    );

    const user = insertResult.rows[0];
    const token = generateToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name
    });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (err) {
    console.error('[Auth Register Error]', err);
    res.status(500).json({ success: false, error: 'Registration failed due to a server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: parseResult.error.errors[0]?.message || 'Invalid email or password'
      });
      return;
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const userResult = await query(
      'SELECT id, full_name, email, phone, password_hash, created_at, updated_at FROM profiles WHERE email = $1',
      [normalizedEmail]
    );

    if (userResult.rowCount === 0) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]', err);
    res.status(500).json({ success: false, error: 'Login failed due to a server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userResult = await query(
      'SELECT id, full_name, email, phone, created_at, updated_at FROM profiles WHERE id = $1',
      [req.user!.id]
    );

    if (userResult.rowCount === 0) {
      res.status(404).json({ success: false, error: 'User profile not found' });
      return;
    }

    res.json({
      success: true,
      data: userResult.rows[0]
    });
  } catch (err) {
    console.error('[Auth Me Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
});

export default router;

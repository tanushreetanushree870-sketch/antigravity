import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { initDb, isUsingFallbackStore } from './db/index.js';
import { seedResources } from './db/seed.js';

import authRouter from './routes/auth.js';
import emergencyRouter from './routes/emergency.js';
import resourcesRouter from './routes/resources.js';
import favoritesRouter from './routes/favorites.js';
import profileRouter from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EmergencyAssist AI Backend',
    database: isUsingFallbackStore() ? 'local_memory_datastore' : 'postgresql',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/profile', profileRouter);

// Serve static assets in production if built
const clientDistPath = path.resolve(process.cwd(), 'dist/client');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving production client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred'
  });
});

// Start Server
async function startServer() {
  try {
    await initDb();
    await seedResources();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚑 EmergencyAssist AI Server running on port ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Startup Fatal Error]', err);
    process.exit(1);
  }
}

startServer();

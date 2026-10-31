require('dotenv').config();
const dns = require('dns');

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const { initSupabaseStorage } = require('./config/supabase');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const seedRoutes = require('./routes/seedRoutes');
const driveRoutes = require('./routes/driveRoutes');
const { syncGoogleDriveSongs } = require('./services/googleDriveService');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable trust proxy for Render reverse proxy HTTPS detection
app.enable('trust proxy');

// Enable CORS for frontend Vite app (http://localhost:5173 or all origins in dev)
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🎵 Welcome to MusicDownload API Server',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      songs: '/api/songs',
      driveSync: '/api/drive/sync',
      featured: '/api/songs/featured',
      genres: '/api/songs/genres',
      seed: '/api/seed',
      auth: '/api/auth',
      health: '/api/health',
      version: '/api/version'
    }
  });
});

// App Version Check endpoint for Mobile APK update notifications
app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    latestVersion: '1.0.1',
    latestVersionCode: 2,
    apkUrl: 'https://idrmusic.netlify.app/IDRMusic.apk',
    releaseNotes: 'New Spotify Mobile layout, fast lag-free loader, updated launcher icon, and audio playback improvements.',
    mandatory: false
  });
});

// API Routes
app.use('/api/songs', songRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes); // Root health check fallback
app.use('/api/seed', seedRoutes);
app.use('/api/drive', driveRoutes);

// Global 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server & Connections
const startServer = async () => {
  console.log('==================================================');
  console.log('🚀 Starting MusicDownload Backend API Server...');
  console.log('==================================================');

  // 1. Connect MongoDB
  await connectDB();

  // 2. Initialize Redis Caching (Fail-soft fallback)
  initRedis();

  // 3. Initialize Supabase Storage Buckets
  await initSupabaseStorage();

  // 4. Trigger initial Google Drive Sync
  try {
    const baseUrl = `http://localhost:${PORT}`;
    await syncGoogleDriveSongs(baseUrl);
  } catch (err) {
    console.log('[Google Drive Warning]: Initial drive sync deferred or empty:', err.message);
  }

  // 5. Listen on PORT
  const server = app.listen(PORT, () => {
    console.log(`[Server Ready] Listening on http://localhost:${PORT}`);
    console.log(`[Health check] http://localhost:${PORT}/api/health`);
    console.log('==================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Port Notice] Port ${PORT} is already in use by an active server instance.`);
    } else {
      console.error('[Server Error]:', err.message);
    }
  });
};

startServer();

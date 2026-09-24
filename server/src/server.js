import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import businessRoutes from './routes/businessRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting to protect external APIs & database
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Middleware
app.use(cors({
  origin: '*', // Allow all local dev origins
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-google-api-key', 'x-gemini-api-key']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to API routes
app.use('/api/', apiLimiter);

// Route endpoints
app.use('/api/businesses', businessRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Local Business Data Finder API',
    hasGoogleKey: Boolean(process.env.GOOGLE_MAPS_API_KEY && !process.env.GOOGLE_MAPS_API_KEY.includes('your_')),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_'))
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 BizScout Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const operationRoutes = require('./routes/operationRoutes');
const patrimonyRoutes = require('./routes/patrimonyRoutes');
const authRoutes = require('./routes/authRoutes');
const ratesRoutes = require('./routes/ratesRoutes');
const closingRoutes = require('./routes/closingRoutes');
const quoteRoutes = require('./routes/quoteRoutes');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS: allow frontend (localhost, Render static sites) and mobile
// In production (Render.com), allow all origins if CORS_ORIGINS=*
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://casa-de-cambio-2.onrender.com',
  'https://grupo-alvarez-frontend.onrender.com'
];
const allowedOriginsEnv = process.env.CORS_ORIGINS;
if (allowedOriginsEnv && allowedOriginsEnv !== '*') {
  allowedOrigins.push(...allowedOriginsEnv.split(',').map((o) => o.trim()));
}
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOriginsEnv === '*') return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/[\w-]+\.onrender\.com$/.test(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};
app.use(cors(corsOptions));

// Simple healthcheck for web & mobile to verify connectivity
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GRUPO ALVAREZ EXCHANGE SYSTEM',
    timestamp: new Date().toISOString()
  });
});

// Example dashboard summary endpoint (stub data for now)
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    totalDailyVolume: 125000.5,
    totalPatrimony: 1850000.75,
    spreadAverage: 0.032,
    operationsToday: 87,
    cashOnHand: 45230.25
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/patrimony', patrimonyRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/closing', closingRoutes);
app.use('/api/quote', quoteRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;


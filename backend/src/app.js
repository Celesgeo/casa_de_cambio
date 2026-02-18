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

// Basic security & parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS: allow frontend (localhost:5173, 5174, etc.) and mobile
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
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
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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


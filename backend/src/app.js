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

// CORS simple: permitir todas las origins y credenciales (Authorization)
app.use(
  cors({
    origin: '*',
    credentials: true
  })
);

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


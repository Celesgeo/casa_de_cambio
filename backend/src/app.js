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
const reportsRoutes = require('./routes/reportsRoutes');
const userRoutes = require('./routes/userRoutes');
const { summary } = require('./controllers/dashboardController');
const { protect } = require('./middleware/authMiddleware');

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
    service: 'Exchange Manager',
    timestamp: new Date().toISOString()
  });
});

// Dashboard summary - requires auth, real data per company
app.get('/api/dashboard/summary', protect, summary);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/patrimony', patrimonyRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/closing', closingRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', userRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;


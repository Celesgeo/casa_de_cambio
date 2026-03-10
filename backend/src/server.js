require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { seedDemo } = require('./scripts/seedDemo');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  try {
    await seedDemo();
  } catch (err) {
    console.error('[startup] seedDemo error:', err.message);
  }

  const server = http.createServer(app);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API running on port ${PORT}`);
    console.log(`  Local:   http://localhost:${PORT}/api`);
    console.log(`  Network: http://<tu-ip>:${PORT}/api (para app móvil)`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});


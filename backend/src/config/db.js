const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MongoDB: MONGODB_URI is not set in .env');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    retryWrites: true
  };

  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected');
    // Quitar índice obsoleto que provoca E11000 (único por currency sin companyId)
    try {
      await mongoose.connection.db.collection('patrimonies').dropIndex('currency_1');
      console.log('MongoDB: dropped obsolete patrimonies index currency_1');
    } catch (e) {
      if (e.code !== 27 && e.message?.indexOf('index not found') === -1) console.warn('Patrimonies index drop:', e.message);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.error('  → Verificá: 1) Internet activo 2) IP en whitelist de MongoDB Atlas 3) Cluster activo');
    }
    if (error.code === 'ENOTFOUND' || error.message?.includes('querySrv')) {
      console.error('  → No se resolvió el host. Revisá MONGODB_URI y conectividad a internet.');
    }
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
};

module.exports = connectDB;


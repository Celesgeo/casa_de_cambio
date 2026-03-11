/**
 * Elimina el índice obsoleto "currency_1" de la colección patrimonies
 * que provoca E11000 duplicate key al tener varios documentos con la misma moneda (multi-tenant).
 * Ejecutar una vez: node scripts/fixPatrimonyIndex.js (desde backend/)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    await mongoose.connection.db.collection('patrimonies').dropIndex('currency_1');
    console.log('Índice currency_1 eliminado correctamente.');
  } catch (e) {
    if (e.code === 27 || (e.message && e.message.includes('index not found'))) {
      console.log('El índice currency_1 no existe (ya está corregido).');
    } else {
      console.error('Error:', e.message);
      process.exit(1);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run();

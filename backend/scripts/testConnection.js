/**
 * Prueba la conexión a MongoDB
 * Run: node scripts/testConnection.js (desde backend/)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI no está en .env');
    process.exit(1);
  }
  console.log('Probando conexión a MongoDB...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('querySrv')) {
      console.log('\nPasos a revisar:');
      console.log('  1. Verificá que tenés internet');
      console.log('  2. MongoDB Atlas: Network Access → agregá 0.0.0.0/0 (o tu IP)');
      console.log('  3. Si usás tier gratuito: el cluster puede pausarse → activalo desde Atlas');
      console.log('  4. Usuario/contraseña en la URI deben coincidir con Atlas');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

test();

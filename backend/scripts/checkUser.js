/**
 * Verificar si el usuario existe en la base de datos
 * Run: node scripts/checkUser.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const DEFAULT_EMAIL = 'grupoalvarez';

async function checkUser() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Conectado a MongoDB');
    
    const user = await User.findOne({ email: DEFAULT_EMAIL });
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Created:', user.createdAt);
    } else {
      console.log('❌ Usuario NO encontrado:', DEFAULT_EMAIL);
      console.log('   Ejecutá: npm run seed');
    }
    
    const allUsers = await User.find({}).select('email name role');
    console.log('\n📋 Todos los usuarios en la base de datos:');
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name}, ${u.role})`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('querySrv')) {
      console.error('  → Revisá: 1) .env tiene MONGODB_URI 2) Internet 3) MongoDB Atlas: IP en whitelist y cluster activo');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();

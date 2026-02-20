/**
 * Seed default user for GRUPO ALVAREZ
 * Run: npm run seed (from backend dir) o node scripts/seedUser.js
 * User: grupoalvarez / elterribleusd1
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const DEFAULT_EMAIL = 'grupoalvarez';
const DEFAULT_PASSWORD = 'elterribleusd1';
const DEFAULT_NAME = 'Grupo Alvarez';

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no está definida en .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    const exists = await User.findOne({ email: DEFAULT_EMAIL });
    if (exists) {
      console.log('User already exists:', DEFAULT_EMAIL);
      return;
    }
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await User.create({
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      password: hashed,
      role: 'admin'
    });
    console.log('User created successfully:', DEFAULT_EMAIL);
  } catch (err) {
    console.error('Seed error:', err.message);
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('querySrv')) {
      console.error('  → Revisá: 1) .env tiene MONGODB_URI 2) Internet 3) MongoDB Atlas: IP en whitelist y cluster activo');
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seed();

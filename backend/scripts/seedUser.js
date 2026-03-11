/**
 * Seed default user for GRUPO ALVAREZ
 * Run: npm run seed (from backend dir) o node scripts/seedUser.js
 * User: grupoalvarez / elterribleusd1
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('../src/models/Company');
const User = require('../src/models/User');
const Patrimony = require('../src/models/Patrimony');

const DEFAULT_EMAIL = 'grupoalvarez';
const DEFAULT_PASSWORD = 'elterribleusd1';
const DEFAULT_NAME = 'Grupo Alvarez';
const COMPANY_NAME = 'GRUPO ALVAREZ';
const CURRENCIES = ['USD', 'ARS', 'EUR', 'BRL', 'CLP'];

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
    let company = await Company.findOne({ name: COMPANY_NAME });
    if (!company) {
      company = await Company.create({ name: COMPANY_NAME, plan: 'standard', isActive: true });
      console.log('Company created:', company.name);
    }
    const cid = company._id;

    let user = await User.findOne({ email: DEFAULT_EMAIL });
    if (user) {
      const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      await User.updateOne(
        { _id: user._id },
        { $set: { companyId: cid, password: hashed } }
      );
      console.log('User updated (company + password reset):', DEFAULT_EMAIL);
      return;
    }
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await User.create({
      companyId: cid,
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL,
      password: hashed,
      role: 'admin'
    });
    console.log('User created successfully:', DEFAULT_EMAIL);

    // Patrimonio inicial en 0 para GRUPO ALVAREZ
    for (const currency of CURRENCIES) {
      await Patrimony.findOneAndUpdate(
        { companyId: cid, currency },
        { amount: 0, lastUpdated: new Date() },
        { new: true, upsert: true }
      );
    }
    console.log('Patrimony initialized for', COMPANY_NAME);
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

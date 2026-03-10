/**
 * Creates Demo Exchange company and demo user if no companies exist.
 * Run on server startup or manually: node scripts/seedDemo.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('../src/models/Company');
const User = require('../src/models/User');

const DEMO_COMPANY = { name: 'Demo Exchange', plan: 'demo', isActive: true };
const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@exchange.com',
  password: 'demo123',
  role: 'admin'
};

async function seedDemo() {
  const count = await Company.countDocuments();
  if (count > 0) return null;

  const company = await Company.create(DEMO_COMPANY);
  const cid = company._id;

  // Migrate orphan documents (legacy data without companyId) to demo company
  const Operation = require('../src/models/Operation');
  const Patrimony = require('../src/models/Patrimony');
  await User.updateMany({ companyId: { $exists: false } }, { $set: { companyId: cid } }).catch(() => {});
  await Operation.updateMany({ companyId: { $exists: false } }, { $set: { companyId: cid } }).catch(() => {});
  await Patrimony.updateMany({ companyId: { $exists: false } }, { $set: { companyId: cid } }).catch(() => {});

  const hashed = await bcrypt.hash(DEMO_USER.password, 10);
  const existingDemo = await User.findOne({ email: DEMO_USER.email });
  if (existingDemo) {
    console.log('[seedDemo] Demo user already exists');
    return { company };
  }
  const user = await User.create({
    companyId: cid,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    password: hashed,
    role: DEMO_USER.role
  });
  console.log('[seedDemo] Created company:', company.name, 'and user:', user.email);
  return { company, user };
}

const runStandalone = require.main === module;
if (runStandalone) {
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => seedDemo())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDemo };

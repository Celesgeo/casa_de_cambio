/**
 * Migration script: Link all existing data to company GRUPO ALVAREZ
 *
 * - Finds or creates company "GRUPO ALVAREZ" (plan: pro, isActive: true)
 * - Updates users, operations, patrimonies where companyId does NOT exist
 * - Does NOT overwrite existing companyId
 * - Preserves all existing data (emails, bcrypt passwords, operations, balances)
 *
 * Run manually: node scripts/migrateToGrupoAlvarez.js
 * Does NOT run automatically on server start.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Set it in .env');
  process.exit(1);
}

const Company = require('../models/Company');
const User = require('../models/User');
const Operation = require('../models/Operation');
const Patrimony = require('../models/Patrimony');

const COMPANY_NAME = 'GRUPO ALVAREZ';
const COMPANY_PLAN = 'pro';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });
  console.log('Connected.');

  // Find or create company
  let company = await Company.findOne({ name: COMPANY_NAME });
  if (!company) {
    company = await Company.create({
      name: COMPANY_NAME,
      plan: COMPANY_PLAN,
      isActive: true,
      logo: ''
    });
    console.log(`Company created: ${company.name} (_id: ${company._id})`);
  } else {
    console.log(`Company found: ${company.name} (_id: ${company._id})`);
  }
  const companyId = company._id;

  // Migrate only documents that do NOT have companyId
  const usersResult = await User.updateMany(
    { companyId: { $exists: false } },
    { $set: { companyId } }
  );
  const operationsResult = await Operation.updateMany(
    { companyId: { $exists: false } },
    { $set: { companyId } }
  );
  const patrimoniesResult = await Patrimony.updateMany(
    { companyId: { $exists: false } },
    { $set: { companyId } }
  );

  console.log('\nMigration complete:');
  console.log(`Users migrated: ${usersResult.modifiedCount}`);
  console.log(`Operations migrated: ${operationsResult.modifiedCount}`);
  console.log(`Patrimonies migrated: ${patrimoniesResult.modifiedCount}`);
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration error:', err.message);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect().catch(() => {}));

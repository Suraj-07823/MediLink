#!/usr/bin/env node
// One-off migration: normalize emergencyContact.phone values in MedicalRecord collection
// Usage: from backend folder run `node scripts/migrate_normalize_medical_phones.js`

const mongoose = require('mongoose');
require('dotenv').config();
const MedicalRecord = require('../models/MedicalRecord');

function normalizePhone(phone) {
  if (!phone) return phone;
  const digits = String(phone).replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (digits.length === 10) return last10;
  if (digits.length > 10 && digits.startsWith('91')) return '91' + last10;
  return last10;
}

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/medilink';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const records = await MedicalRecord.find({});
  console.log(`Found ${records.length} medical records`);
  let updated = 0;

  for (const r of records) {
    const phone = r.emergencyContact && r.emergencyContact.phone;
    if (!phone) continue;
    const norm = normalizePhone(phone);
    if (norm !== phone) {
      await MedicalRecord.updateOne({ _id: r._id }, { $set: { 'emergencyContact.phone': norm } });
      console.log(`Updated ${r._id}: ${phone} -> ${norm}`);
      updated++;
    }
  }

  console.log(`Migration complete. Updated ${updated} records.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});

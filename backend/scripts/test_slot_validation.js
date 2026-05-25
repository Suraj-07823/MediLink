#!/usr/bin/env node
// Quick validation script for Slot schema (no DB required)
const mongoose = require('mongoose');
const Slot = require('../models/Slot');

async function check(doc) {
  const s = new Slot(doc);
  try {
    await s.validate();
    console.log('OK :', JSON.stringify(doc));
    return true;
  } catch (err) {
    console.log('FAIL:', JSON.stringify(doc));
    if (err && err.errors) {
      for (const k of Object.keys(err.errors)) {
        console.log('  ', k, ':', err.errors[k].message);
      }
    } else {
      console.log(err.message || err);
    }
    return false;
  }
}

async function run() {
  // valid normal slot
  await check({ doctorId: new mongoose.Types.ObjectId(), dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', maxPatients: 3 });
  // valid cross-midnight
  await check({ doctorId: new mongoose.Types.ObjectId(), dayOfWeek: 'Saturday', startTime: '23:00', endTime: '01:00', maxPatients: 2 });
  // invalid zero-length
  await check({ doctorId: new mongoose.Types.ObjectId(), dayOfWeek: 'Sunday', startTime: '10:00', endTime: '10:00', maxPatients: 1 });
}

run().catch(e => { console.error(e); process.exit(1); });

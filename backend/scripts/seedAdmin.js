/**
 * Create the first admin user (run on EC2 after MongoDB is up).
 *
 * Usage (from backend/):
 *   SEED_ADMIN_EMAIL=admin@punjab.gov SEED_ADMIN_PASSWORD='StrongPass!' npm run seed:admin
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Platform Administrator';

  if (!email || !password) {
    console.error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD');
    process.exit(1);
  }

  await mongoose.connect(config.mongoUri);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('User with this email already exists — skipping.');
    await mongoose.connection.close();
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: 'admin',
  });

  console.log('Admin user created successfully.');
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});

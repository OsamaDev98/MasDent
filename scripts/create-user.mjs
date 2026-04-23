/**
 * Create a staff/admin user in MongoDB.
 * 
 * Usage:
 *   node scripts/create-user.mjs <username> <password> <name> [role]
 * 
 * Example:
 *   node scripts/create-user.mjs admin secret123 "Dr. Admin" admin
 *   node scripts/create-user.mjs dr.sarah pass456 "Dr. Sarah Mitchell" staff
 * 
 * Requires MONGODB_URI in .env.local
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#')) {
      let val = v.join('=').trim();
      // Remove surrounding quotes if they exist
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[k.trim()] = val;
    }
  }
} catch (e) {}

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const [,, username, password, name, role = 'staff'] = process.argv;

if (!username || !password || !name) {
  console.error('Usage: node scripts/create-user.mjs <username> <password> <name> [role]');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set in .env.local'); process.exit(1); }

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, required: true },
  role:         { type: String, enum: ['admin','staff'], default: 'staff' },
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const exists = await User.findOne({ username: username.toLowerCase() });
  if (exists) { console.error(`User "${username}" already exists.`); process.exit(1); }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ username: username.toLowerCase(), passwordHash, name, role });
  console.log(`✅ User created: ${name} (${username}) — role: ${role}`);
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });

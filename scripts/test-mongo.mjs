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
} catch (e) {
  console.error("Warning: Could not read .env.local");
}

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function testConnection() {
  console.log(`Connecting to URI starting with: ${MONGODB_URI.substring(0, 15)}...`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB!');
    await mongoose.disconnect();
    console.log('Connection closed cleanly.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

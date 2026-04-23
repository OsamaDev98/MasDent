/**
 * Database Seed Script — run with: npx tsx src/scripts/seed.ts
 * Creates: default admin user + sample services if they don't exist
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Inline schemas to avoid Next.js model-caching issues in script context
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
});

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  nameAr:      { type: String, required: true },
  price:       { type: Number, required: true },
  duration:    { type: Number, required: true },
  category:    { type: String, required: true },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

const DEFAULT_SERVICES = [
  { name: 'Dental Cleaning',       nameAr: 'تنظيف الأسنان',        price: 150, duration: 45,  category: 'Preventive',    description: 'Professional teeth cleaning and plaque removal' },
  { name: 'Dental Filling',        nameAr: 'حشوة الأسنان',         price: 250, duration: 60,  category: 'General',       description: 'Composite or amalgam fillings for cavities' },
  { name: 'Teeth Whitening',       nameAr: 'تبييض الأسنان',        price: 800, duration: 90,  category: 'Cosmetic',      description: 'Professional in-office teeth whitening treatment' },
  { name: 'Dental Implant',        nameAr: 'زراعة الأسنان',        price: 4500, duration: 120, category: 'Surgery',      description: 'Full titanium implant with crown placement' },
  { name: 'Orthodontics (Braces)', nameAr: 'تقويم الأسنان',        price: 12000, duration: 60, category: 'Orthodontics', description: 'Traditional metal braces treatment' },
  { name: 'Dental Veneers',        nameAr: 'قشور الأسنان',         price: 1200, duration: 90,  category: 'Cosmetic',     description: 'Porcelain veneers for smile enhancement' },
  { name: 'Root Canal Treatment',  nameAr: 'علاج العصب',           price: 1800, duration: 90,  category: 'General',      description: 'Complete root canal therapy' },
  { name: 'Tooth Extraction',      nameAr: 'خلع الأسنان',          price: 350, duration: 30,   category: 'Surgery',      description: 'Simple and surgical tooth extractions' },
  { name: 'Dental X-Ray',          nameAr: 'أشعة الأسنان',         price: 80,  duration: 15,   category: 'Preventive',   description: 'Digital panoramic or periapical X-rays' },
  { name: 'Emergency Dental Care', nameAr: 'علاج طارئ',            price: 400, duration: 60,   category: 'Emergency',    description: 'Immediate care for dental emergencies and pain' },
  { name: 'Invisalign',            nameAr: 'انفيزالين',             price: 18000, duration: 60, category: 'Orthodontics', description: 'Clear aligner orthodontic treatment' },
  { name: 'Dental Crown',          nameAr: 'تاج الأسنان',          price: 1500, duration: 90,  category: 'General',      description: 'Porcelain or zirconia dental crown placement' },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Add it to .env.local');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('✅ Connected');

  // 1. Create default admin
  const existing = await User.findOne({ username: 'admin' });
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', passwordHash, name: 'Admin', role: 'admin' });
    console.log('✅ Admin user created — username: admin / password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists, skipping');
  }

  // 2. Seed staff user
  const staffExists = await User.findOne({ username: 'staff' });
  if (!staffExists) {
    const passwordHash = await bcrypt.hash('staff123', 10);
    await User.create({ username: 'staff', passwordHash, name: 'Receptionist', role: 'staff' });
    console.log('✅ Staff user created — username: staff / password: staff123');
  } else {
    console.log('ℹ️  Staff user already exists, skipping');
  }

  // 3. Seed services
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(DEFAULT_SERVICES);
    console.log(`✅ ${DEFAULT_SERVICES.length} services seeded`);
  } else {
    console.log(`ℹ️  Services already exist (${serviceCount}), skipping`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seed complete! You can now login at /en/dashboard/login');
  console.log('   Admin: admin / admin123');
  console.log('   Staff: staff / staff123\n');
}

seed().catch(e => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});

import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/models/Settings';

export async function getSettings() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({});
    }
    // Return a plain object to avoid Next.js serialization issues
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

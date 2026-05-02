import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Settings } from '@/models/Settings';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (payload.role !== 'admin') throw new Error('Forbidden');
  return payload;
}

const ALLOWED_FIELDS = [
  'clinicName','clinicNameAr','phone','email','whatsapp',
  'address','addressAr','workStart','workEnd','workDays',
  'breakStart','breakEnd','notifications',
];

// GET /api/settings — admin only, returns (or creates) the singleton settings doc
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    // findOneAndUpdate with upsert ensures exactly one settings document always exists
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({});
    }
    return NextResponse.json({ settings });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden')    return NextResponse.json({ error: 'Forbidden' },     { status: 403 });
    if (e instanceof Error && e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' },  { status: 401 });
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

import { revalidatePath } from 'next/cache';

// PATCH /api/settings — admin only, update any subset of settings
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const body = await request.json();

    // Whitelist fields
    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Validate workDays is an array of strings
    if (update.workDays !== undefined) {
      if (!Array.isArray(update.workDays) || (update.workDays as unknown[]).some(d => typeof d !== 'string')) {
        return NextResponse.json({ error: 'Invalid workDays' }, { status: 400 });
      }
    }

    console.log('[PATCH /api/settings] Body received:', body);
    console.log('[PATCH /api/settings] Update object:', update);

    // Upsert: create if it doesn't exist yet
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    console.log('[PATCH /api/settings] Saved settings:', settings);

    // Invalidate next.js cache for the layout so the SettingsProvider gets fresh data
    revalidatePath('/', 'layout');

    return NextResponse.json({ settings });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden')    return NextResponse.json({ error: 'Forbidden' },     { status: 403 });
    if (e instanceof Error && e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' },  { status: 401 });
    console.error('[PATCH /api/settings]', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

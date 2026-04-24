import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (payload.role !== 'admin') throw new Error('Forbidden');
  return payload;
}

const ALLOWED_SERVICE_FIELDS = ['name', 'nameAr', 'price', 'duration', 'category', 'description', 'isActive'];

// PATCH /api/services/[id] — whitelist to prevent mass-assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Whitelist allowed fields
    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_SERVICE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Validate price / duration ranges
    if (update.price !== undefined && (typeof update.price !== 'number' || (update.price as number) < 0)) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }
    if (update.duration !== undefined && (typeof update.duration !== 'number' || (update.duration as number) < 5)) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    const service = await Service.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ service });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (e instanceof Error && e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('[PATCH /api/services/[id]]', e);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE /api/services/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { id } = await params;
    await Service.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

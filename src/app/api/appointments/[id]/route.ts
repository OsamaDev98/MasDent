import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  await verifyToken(token);
}

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'] as const;
const ALLOWED_PATCH_FIELDS = ['status', 'paymentStatus', 'paymentNotes', 'time', 'notes', 'date', 'service', 'name', 'phone', 'email'];

// PATCH /api/appointments/[id] — update status, payment, or full edit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();

    // Whitelist allowed fields (prevent mass-assignment)
    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    // Validate status if provided
    if (update.status && !VALID_STATUSES.includes(update.status as typeof VALID_STATUSES[number])) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Validate paymentStatus if provided
    if (update.paymentStatus && !['paid', 'unpaid'].includes(update.paymentStatus as string)) {
      return NextResponse.json({ error: 'Invalid paymentStatus' }, { status: 400 });
    }

    await connectDB();
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ appointment });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PATCH /api/appointments/[id]]', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;

    await connectDB();
    await Appointment.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

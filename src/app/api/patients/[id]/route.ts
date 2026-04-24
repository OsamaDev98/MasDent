import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Patient } from '@/models/Patient';
import { Appointment } from '@/models/Appointment';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}

const ALLOWED_PATCH_FIELDS = ['name', 'phone', 'email', 'dateOfBirth', 'gender', 'address', 'notes', 'lastVisit', 'images'];

// GET /api/patients/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    await connectDB();
    const { id } = await params;
    const patient = await Patient.findById(id).lean();
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Get appointment history
    const appointments = await Appointment.find({
      $or: [{ patientId: id }, { phone: (patient as { phone: string }).phone }],
    }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ patient, appointments });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH /api/patients/[id] — whitelist fields to prevent mass-assignment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Whitelist allowed fields
    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const patient = await Patient.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true }).lean();
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ patient });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PATCH /api/patients/[id]]', e);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

// DELETE /api/patients/[id] — admin only
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await requireAuth(request);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const { id } = await params;
    await Patient.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

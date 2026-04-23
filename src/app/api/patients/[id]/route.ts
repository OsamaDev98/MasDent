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

// GET /api/patients/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    await connectDB();
    const { id } = await params;
    const patient = await Patient.findById(id).lean();
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Get appointment history
    const appointments = await Appointment.find({ $or: [{ patientId: id }, { phone: (patient as { phone: string }).phone }] })
      .sort({ createdAt: -1 }).lean();
    return NextResponse.json({ patient, appointments });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// PATCH /api/patients/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const patient = await Patient.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ patient });
  } catch {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

// DELETE /api/patients/[id]  
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

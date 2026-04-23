import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}

// GET /api/appointments — protected, with filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const q = searchParams.get('q');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (status && status !== 'all') query.status = status;
    if (date) query.date = date;
    if (q) query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/appointments — public (from booking form) OR authenticated (manual add)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, service, notes, patientId } = body;

    if (!name || !email || !phone || !date || !service) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    const appointment = await Appointment.create({
      name, email, phone, date, time: time || '',
      service, notes: notes || '',
      patientId: patientId || null,
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/appointments]', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

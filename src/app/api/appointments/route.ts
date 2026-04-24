import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}

/** Escape special regex characters to prevent ReDoS / injection */
function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

// GET /api/appointments — protected, with filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const date   = searchParams.get('date');
    const q      = searchParams.get('q');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Validate status value before using in query
    if (status && status !== 'all') {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
      }
      query.status = status;
    }

    if (date) query.date = date;

    // Escape user input before using in $regex to prevent injection
    if (q) {
      const safe = escapeRegex(q.slice(0, 100)); // also cap length
      query.$or = [
        { name:  { $regex: safe, $options: 'i' } },
        { phone: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
      ];
    }

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(500)   // cap results for performance
      .lean();

    return NextResponse.json({ appointments });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/appointments — public (from booking form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, service, notes, patientId } = body;

    if (!name || !email || !phone || !date || !service) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basic string length guards
    if (name.length > 100 || email.length > 200 || phone.length > 30 || service.length > 100) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    await connectDB();
    const appointment = await Appointment.create({
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      phone:     phone.trim(),
      date,
      time:      time || '',
      service:   service.trim(),
      notes:     notes ? notes.slice(0, 1000) : '',
      patientId: patientId || null,
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/appointments]', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

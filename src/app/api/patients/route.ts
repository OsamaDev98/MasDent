import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Patient } from '@/models/Patient';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}

// GET /api/patients?q=search
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();
    const q = request.nextUrl.searchParams.get('q');
    const query = q
      ? { $or: [
          { name: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ]}
      : {};
    const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ patients });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/patients — create new patient
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();
    const body = await request.json();
    const { name, phone, email, dateOfBirth, gender, address, notes } = body;
    if (!name || !phone) return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
    const patient = await Patient.create({ name, phone, email, dateOfBirth, gender, address, notes });
    return NextResponse.json({ patient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

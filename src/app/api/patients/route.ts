import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Patient } from '@/models/Patient';
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

// GET /api/patients?q=search
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();

    const q = request.nextUrl.searchParams.get('q');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (q) {
      const safe = escapeRegex(q.slice(0, 100)); // cap + escape
      query.$or = [
        { name:  { $regex: safe, $options: 'i' } },
        { phone: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

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
    const { name, phone, email, dateOfBirth, gender, address, notes, images } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
    }

    // Length guards
    if (name.length > 100 || phone.length > 30) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    // Validate gender if provided
    if (gender && !['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 });
    }

    // Limit images array size (base64 can be huge)
    const safeImages = Array.isArray(images) ? images.slice(0, 20) : [];

    const patient = await Patient.create({
      name:        name.trim(),
      phone:       phone.trim(),
      email:       email ? email.trim().toLowerCase() : '',
      dateOfBirth: dateOfBirth || '',
      gender:      gender || 'male',
      address:     address || '',
      notes:       notes ? notes.slice(0, 2000) : '',
      images:      safeImages,
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[POST /api/patients]', e);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}

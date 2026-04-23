import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (payload.role !== 'admin') throw new Error('Forbidden');
  return payload;
}

// GET /api/staff — list all staff (admin)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const staff = await User.find({}, { passwordHash: 0 }).lean();
    return NextResponse.json({ staff });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/staff — create new staff member (admin)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { username, password, name, role } = await request.json();
    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password, and name are required' }, { status: 400 });
    }
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username: username.toLowerCase().trim(), passwordHash, name, role: role || 'staff' });
    return NextResponse.json({ user: { _id: user._id, username: user.username, name: user.name, role: user.role } }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

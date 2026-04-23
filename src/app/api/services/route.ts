import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/models/Service';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  return verifyToken(token);
}
async function requireAdmin(request: NextRequest) {
  const payload = await requireAuth(request);
  if (payload.role !== 'admin') throw new Error('Forbidden');
  return payload;
}

// GET /api/services — any authenticated user
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    await connectDB();
    const services = await Service.find().sort({ category: 1, name: 1 }).lean();
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// POST /api/services — admin only
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();
    const body = await request.json();
    const { name, nameAr, price, duration, category, description } = body;
    if (!name || !nameAr || price === undefined || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const service = await Service.create({ name, nameAr, price, duration, category, description });
    return NextResponse.json({ service }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

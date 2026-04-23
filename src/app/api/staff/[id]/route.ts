import { NextRequest, NextResponse } from 'next/server';
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

// PATCH /api/staff/[id] — update name/role
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    await connectDB();
    const { id } = await params;
    const { name, role } = await request.json();
    const user = await User.findByIdAndUpdate(id, { name, role }, { new: true, select: '-passwordHash' }).lean();
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// DELETE /api/staff/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const self = await requireAdmin(request);
    await connectDB();
    const { id } = await params;
    // Prevent deleting yourself
    if (self.userId === id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

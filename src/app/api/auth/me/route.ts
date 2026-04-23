import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const payload = await verifyToken(token);
    return NextResponse.json({
      user: {
        userId: payload.userId,
        username: payload.username,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

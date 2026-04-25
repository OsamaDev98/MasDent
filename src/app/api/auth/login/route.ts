import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { signToken, AUTH_COOKIE } from '@/lib/auth';

// ── In-memory rate limiter ──────────────────────────────────────────────────
// Allows 5 failed attempts per IP within a 15-minute window.
const WINDOW_MS   = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface RateLimitEntry { count: number; resetAt: number }
const rateLimitMap = new Map<string, RateLimitEntry>();

/** Returns true if the request should be blocked. Increments the counter. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // First attempt in this window (or window expired)
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) return true;
  return false;
}

/** Reset counter after a successful login */
function resetRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Derive client IP (X-Forwarded-For is set by Vercel / reverse proxies)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      // Use constant-time comparison to prevent timing attacks
      await bcrypt.compare(password, '$2b$10$invalid.hash.to.prevent.timing');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Successful login — clear rate limit counter
    resetRateLimit(ip);

    const token = await signToken({
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, username: user.username, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


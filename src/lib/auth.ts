import { SignJWT, jwtVerify } from 'jose';

// Hard-fail at startup if JWT_SECRET is not set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Set it in your .env.local or hosting platform.');
  }
  // Dev-only fallback (will warn in console)
  console.warn('[auth] WARNING: JWT_SECRET is not set. Using insecure dev fallback — DO NOT use in production.');
}
const secret = new TextEncoder().encode(JWT_SECRET ?? 'dev-only-insecure-fallback-secret-32chars');

export interface JWTPayload {
  userId:   string;
  username: string;
  name:     string;
  role:     string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
}

export const AUTH_COOKIE = 'masdent_auth';

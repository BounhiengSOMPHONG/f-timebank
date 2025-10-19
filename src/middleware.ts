import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'this-is-a-super-secret-key');

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('auth_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!accessToken) {
    // If no access token, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(accessToken, JWT_SECRET);

    // Ensure role is admin
    if ((payload as any).role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    if ((error as any)?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      console.warn('JWT signature verification failed; attempting external validation/refresh');
    } else {
      console.error('JWT Verification Error:', error);
    }

    // If verification failed (likely different signing key), try validating token with external API
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const validateRes = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (validateRes.ok) {
        const me = await validateRes.json();
        if (me.user?.role === 'admin') {
          return NextResponse.next();
        }
      }
    } catch (validateError) {
      console.error('External token validation failed:', validateError);
    }

    // Try to refresh the access token using refresh token
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          const res = NextResponse.next();
          // set new tokens
          if (data.accessToken) {
            res.cookies.set('auth_token', data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 15,
              path: '/',
            });
          }
          if (data.refreshToken) {
            res.cookies.set('refresh_token', data.refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
            });
          }

          return res;
        }
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
      }
    }

    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}

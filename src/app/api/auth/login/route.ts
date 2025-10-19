import { sign } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { setCookie } from 'cookies-next';

// In a real app, use a secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'this-is-a-super-secret-key';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (username === 'admin' && password === 'admin') {
    const token = sign({ username }, JWT_SECRET, { expiresIn: '1h' });

    const response = NextResponse.json({ success: true });
    setCookie('auth_token', token, { req: request, res: response, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return response;
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }
}
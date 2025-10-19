import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, remember } = body;

    // Call external API
    const apiResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password, remember }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Invalid credentials' },
        { status: apiResponse.status }
      );
    }

    // Check if user is admin
    if (data.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access only' },
        { status: 403 }
      );
    }

    // Create response with tokens in cookies and include tokens in JSON body
    const response = NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    // Set access token cookie
    response.cookies.set('auth_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    // Set refresh token cookie
    response.cookies.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
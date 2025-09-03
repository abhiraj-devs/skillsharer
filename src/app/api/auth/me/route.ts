'use server';
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, secret);
      // The decoded object will contain the payload you signed
      // e.g., { id: '1', name: 'Test User', email: 'test@example.com', iat, exp }
      // You can do a DB lookup here if you want to return fresh user data
      
      const user = decoded as any;

      return NextResponse.json({ user: {
        id: user.id,
        name: user.name,
        email: user.email
      }});

    } catch (error) {
      // This will catch errors like expired tokens
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

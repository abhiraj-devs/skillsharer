'use server';
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// In a real application, you'd want to store and retrieve users from a database.
// For now, we'll modify the in-memory array.
const users = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  },
];

export async function PUT(request: NextRequest) {
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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret) as any;
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update the user's name in our mock user list
    user.name = name;

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    
    return NextResponse.json({ user: userResponse });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

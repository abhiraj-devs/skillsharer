'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { users } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const secret = process.env.JWT_SECRET;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    const user = users.find((user) => user.email === email);

    // In a real app, you would compare a hashed password.
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Sign a token
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, secret, {
      expiresIn: '1h',
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({ user: userResponse, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

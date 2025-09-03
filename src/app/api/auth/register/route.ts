'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// This is a mock implementation. In a real app, you'd use a database.
const users: any[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In a real app, this should be hashed
  },
];

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

    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // In a real app, you would hash the password here.
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password, // Store hashed password
      name: email.split('@')[0], // Simple name generation
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, secret, {
      expiresIn: '1h',
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    return NextResponse.json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { users } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { email, password, name, skills } = await request.json();
    const secret = process.env.JWT_SECRET;

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
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
      name,
      skills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email, skills: newUser.skills }, secret, {
      expiresIn: '1h',
    });

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      skills: newUser.skills,
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

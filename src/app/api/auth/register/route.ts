import { NextResponse } from 'next/server';

// This is a mock implementation. In a real app, you'd use a database.
const users: any[] = [
    {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  },
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // In a real app, you would hash the password here.
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password,
      name: email.split('@')[0], // Simple name generation
    };

    users.push(newUser);

    return NextResponse.json({ message: 'User registered successfully', user: {id: newUser.id, email: newUser.email, name: newUser.name} }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}


'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';


export async function POST(request: Request) {
  try {
    await dbConnect();
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

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      skills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
    });

    await newUser.save();

    const token = jwt.sign(
        { id: newUser._id, name: newUser.name, email: newUser.email, skills: newUser.skills }, 
        secret, 
        { expiresIn: '1h' }
    );

    const userResponse = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      skills: newUser.skills,
      image: newUser.avatar,
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

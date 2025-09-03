
'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { identifier, password } = await request.json(); 
    const secret = process.env.JWT_SECRET;
    
    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    // Find user by either email or name (username)
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { name: identifier }],
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password!);
    if (!isPasswordMatch) {
         return NextResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
         );
    }

    const tokenPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        bio: user.bio,
    };

    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: '1h',
    });

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: user.skills,
      image: user.avatar,
      bio: user.bio,
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

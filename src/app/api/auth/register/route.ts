
'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';


export async function POST(request: Request) {
  try {
    await dbConnect();
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

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default name from email
    const name = email.split('@')[0];

    const userToSave = new UserModel({
      email,
      password: hashedPassword,
      name: name,
      skills: [],
    });

    const newUser = await userToSave.save();


    const tokenPayload = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        skills: newUser.skills,
        bio: newUser.bio,
    };
    
    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: '1h',
    });
    
    const userResponse = {
      id: newUser._id.toString(),
      _id: newUser._id.toString(), // Ensure _id is also sent
      name: newUser.name,
      email: newUser.email,
      skills: newUser.skills,
      image: newUser.avatar,
      bio: newUser.bio,
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

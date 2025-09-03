
'use server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

async function verifyRecaptcha(token: string) {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        console.warn("RECAPTCHA_SECRET_KEY is not set. Skipping verification.");
        // In a real production environment, you should throw an error here.
        // For development, we'll allow it to pass.
        return true;
    }
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
        method: 'POST'
    });
    const data = await response.json();
    return data.success;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { identifier, password, recaptchaToken } = await request.json(); // Changed from email to identifier
    const secret = process.env.JWT_SECRET;
    
    if (!recaptchaToken) {
        return NextResponse.json({ message: 'reCAPTCHA verification failed.' }, { status: 400 });
    }

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
        return NextResponse.json({ message: 'reCAPTCHA verification failed. Are you a robot?' }, { status: 403 });
    }


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


'use server';
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('Authorization');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { name, skills } = await request.json();

    if (!name && !skills) {
      return NextResponse.json(
        { message: 'Name or skills are required' },
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

    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (name) {
      user.name = name;
    }
    if (skills) {
      user.skills = skills;
    }

    await user.save();

    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: user.skills,
      image: user.avatar
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

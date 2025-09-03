
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
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

    try {
      const decoded = jwt.verify(token, secret) as any;

      const userFromDb = await UserModel.findById(new Types.ObjectId(decoded.id));

      if (!userFromDb) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      const user = {
        id: userFromDb._id.toString(),
        name: userFromDb.name,
        email: userFromDb.email,
        skills: userFromDb.skills,
        image: userFromDb.avatar,
        bio: userFromDb.bio,
      };

      return NextResponse.json({ user });

    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}


'use server';
import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

// GET a single user profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userId = params.id;

    if (!Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return a public-safe user object
    const userResponse = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      skills: user.skills,
      image: user.avatar,
      bio: user.bio,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

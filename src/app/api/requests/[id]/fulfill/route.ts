
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

// This endpoint is currently not in use.
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    return NextResponse.json({ message: 'This feature is not enabled.' }, { status: 404 });
}

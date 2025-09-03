
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = verifyJwt(token);
    if (!decodedToken || !decodedToken.id) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const requestOwnerId = new Types.ObjectId(decodedToken.id);
    const requestId = params.id;
    const { solverId } = await request.json();

    if (!solverId) {
      return NextResponse.json({ message: 'Solver ID is required.' }, { status: 400 });
    }

    const requestToFulfill = await RequestModel.findById(requestId).session(session);

    if (!requestToFulfill) {
      throw new Error('Request not found.');
    }
    if (requestToFulfill.user.toString() !== requestOwnerId.toString()) {
      throw new Error('Forbidden. Only the request owner can fulfill it.');
    }
    if (requestToFulfill.status === 'fulfilled') {
      throw new Error('This request has already been fulfilled.');
    }

    const solver = await UserModel.findById(solverId).session(session);
    if (!solver) {
      throw new Error('Solver not found.');
    }

    // Update solver's earnings
    solver.totalEarnings += requestToFulfill.budget;
    await solver.save({ session });

    // Update request status
    requestToFulfill.status = 'fulfilled';
    requestToFulfill.solver = solver._id;
    requestToFulfill.completedAt = new Date();
    await requestToFulfill.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    // Repopulate for the response
    const fulfilledRequest = await RequestModel.findById(requestId)
        .populate({ path: 'user', model: UserModel, select: 'name avatar' })
        .populate({ path: 'solver', model: UserModel, select: 'name avatar totalEarnings' });

    return NextResponse.json(fulfilledRequest);

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Fulfillment error:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

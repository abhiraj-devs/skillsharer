
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

  const userId = new Types.ObjectId(decodedToken.id);
  const requestId = params.id;

  try {
    const { solverId } = await request.json();
    if (!solverId) {
      return NextResponse.json({ message: 'Solver ID is required' }, { status: 400 });
    }

    const requestToFulfill = await RequestModel.findById(requestId);

    if (!requestToFulfill) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    if (requestToFulfill.user.toString() !== userId.toString()) {
      return NextResponse.json({ message: 'Forbidden: You are not the owner of this request.' }, { status: 403 });
    }

    if (requestToFulfill.status === 'fulfilled') {
      return NextResponse.json({ message: 'Request already fulfilled' }, { status: 400 });
    }

    const solver = await UserModel.findById(solverId);
    if (!solver) {
      return NextResponse.json({ message: 'Solver not found' }, { status: 404 });
    }

    // Update solver's earnings
    solver.totalEarnings = (solver.totalEarnings || 0) + requestToFulfill.budget;
    await solver.save();

    // Update the request
    requestToFulfill.status = 'fulfilled';
    requestToFulfill.solver = new Types.ObjectId(solverId);
    requestToFulfill.completedAt = new Date();
    await requestToFulfill.save();
    
    // Populate user and solver for the response
    const populatedRequest = await RequestModel.findById(requestId)
      .populate({ path: 'user', model: UserModel, select: 'name avatar' })
      .populate({ path: 'solver', model: UserModel, select: 'name avatar' });

    if (!populatedRequest) {
        throw new Error("Failed to populate request after fulfillment");
    }

    return NextResponse.json({
        id: populatedRequest._id.toString(),
        title: populatedRequest.title,
        description: populatedRequest.description,
        budget: populatedRequest.budget,
        tags: populatedRequest.tags,
        status: populatedRequest.status,
        user: populatedRequest.user,
        solver: populatedRequest.solver,
    });

  } catch (error) {
    console.error('Fulfillment Error:', error);
    return NextResponse.json({ message: 'Error fulfilling request' }, { status: 500 });
  }
}

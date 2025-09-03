
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';
import { Types } from 'mongoose';


// GET a single request
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const requestDoc = await RequestModel.findById(params.id).populate({ path: 'user', model: UserModel, select: 'name avatar' });
        if (!requestDoc) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }
        return NextResponse.json(requestDoc);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching request' }, { status: 500 });
    }
}


// PUT (update) a request
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    try {
        const body = await request.json();
        const { title, description, budget, tags } = body;

        const requestToUpdate = await RequestModel.findById(params.id);

        if (!requestToUpdate) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (requestToUpdate.user.toString() !== userId.toString()) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        requestToUpdate.title = title;
        requestToUpdate.description = description;
        requestToUpdate.budget = budget;
        requestToUpdate.tags = tags.split(',').map((tag: string) => tag.trim());

        await requestToUpdate.save();
        
        const updatedRequest = await RequestModel.findById(requestToUpdate._id).populate({ path: 'user', model: UserModel, select: 'name avatar' });

         if (!updatedRequest) {
          throw new Error('Request update failed');
        }

        const responseRequest = {
            id: updatedRequest._id.toString(),
            title: updatedRequest.title,
            description: updatedRequest.description,
            budget: updatedRequest.budget,
            tags: updatedRequest.tags,
            user: {
                id: updatedRequest.user._id.toString(),
                name: updatedRequest.user.name,
                avatar: updatedRequest.user.avatar,
            }
        };

        return NextResponse.json(responseRequest);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error updating request' }, { status: 500 });
    }
}

// DELETE a request
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    try {
        const requestToDelete = await RequestModel.findById(params.id);

        if (!requestToDelete) {
            return NextResponse.json({ message: 'Request not found' }, { status: 404 });
        }

        if (requestToDelete.user.toString() !== userId.toString()) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        
        await RequestModel.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting request' }, { status: 500 });
    }
}


'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import UserModel from '@/models/User';

// GET all requests
export async function GET() {
    await dbConnect();
    const requests = await RequestModel.find({})
        .populate({ path: 'user', model: UserModel, select: 'name avatar' })
        .populate({ path: 'solver', model: UserModel, select: 'name avatar' })
        .sort({ createdAt: -1 });

    const formattedRequests = requests
      .filter(request => request.user) // Filter out requests with null users
      .map(request => ({
        id: request._id.toString(),
        title: request.title,
        description: request.description,
        budget: request.budget,
        tags: request.tags,
        status: request.status,
        user: {
            id: request.user._id.toString(),
            name: request.user.name,
            avatar: request.user.avatar,
        },
        solver: request.solver ? {
            id: (request.solver as any)._id.toString(),
            name: (request.solver as any).name,
            avatar: (request.solver as any).avatar,
        } : undefined,
    }));

    return NextResponse.json(formattedRequests);
}

// POST a new request
export async function POST(request: NextRequest) {
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
    
    const userId = decodedToken.id;

    try {
        const body = await request.json();
        const { title, description, budget, tags } = body;

        if (!title || !description || !budget || !tags) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const newRequest = new RequestModel({
            title,
            description,
            budget,
            tags: tags.split(',').map((tag: string) => tag.trim()),
            user: userId,
        });

        await newRequest.save();

        const createdRequest = await RequestModel.findById(newRequest._id).populate({ path: 'user', model: UserModel, select: 'name avatar' });

         if (!createdRequest) {
          throw new Error('Request creation failed');
        }

        const responseRequest = {
            id: createdRequest._id.toString(),
            title: createdRequest.title,
            description: createdRequest.description,
            budget: createdRequest.budget,
            tags: createdRequest.tags,
            status: createdRequest.status,
            user: {
                id: createdRequest.user._id.toString(),
                name: createdRequest.user.name,
                avatar: createdRequest.user.avatar,
            }
        };

        return NextResponse.json(responseRequest, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating request' }, { status: 500 });
    }
}

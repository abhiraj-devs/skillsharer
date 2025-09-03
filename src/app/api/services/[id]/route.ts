
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ServiceModel from '@/models/Service';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

// GET a single service (not strictly needed for now, but good practice)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const service = await ServiceModel.findById(params.id).populate({ path: 'user', model: UserModel, select: 'name avatar' });
        if (!service) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }
        return NextResponse.json(service);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching service' }, { status: 500 });
    }
}


// PUT (update) a service
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
        const { title, category, price, imageUrl } = body;

        const serviceToUpdate = await ServiceModel.findById(params.id);

        if (!serviceToUpdate) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }

        if (serviceToUpdate.user.toString() !== userId.toString()) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        serviceToUpdate.title = title;
        serviceToUpdate.category = category;
        serviceToUpdate.price = price;
        serviceToUpdate.imageUrl = imageUrl;

        await serviceToUpdate.save();
        
        const updatedService = await ServiceModel.findById(serviceToUpdate._id).populate({ path: 'user', model: UserModel, select: 'name avatar' });

         if (!updatedService) {
          throw new Error('Service update failed');
        }

        const responseService = {
            id: updatedService._id.toString(),
            title: updatedService.title,
            category: updatedService.category,
            price: updatedService.price,
            imageUrl: updatedService.imageUrl,
            rating: updatedService.rating,
            user: {
                id: (updatedService.user as any)._id.toString(),
                name: (updatedService.user as any).name,
                avatar: (updatedService.user as any).avatar,
            }
        };

        return NextResponse.json(responseService);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error updating service' }, { status: 500 });
    }
}

// DELETE a service
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
        const serviceToDelete = await ServiceModel.findById(params.id);

        if (!serviceToDelete) {
            return NextResponse.json({ message: 'Service not found' }, { status: 404 });
        }

        if (serviceToDelete.user.toString() !== userId.toString()) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        
        await ServiceModel.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting service' }, { status: 500 });
    }
}


'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ServiceModel from '@/models/Service';
import UserModel from '@/models/User';

// GET all services
export async function GET() {
    await dbConnect();
    const services = await ServiceModel.find({})
      .populate({ path: 'user', model: UserModel, select: 'name avatar' })
      .sort({ createdAt: -1 });

    const formattedServices = services.map(service => ({
        id: service._id.toString(),
        title: service.title,
        category: service.category,
        price: service.price,
        imageUrl: service.imageUrl,
        rating: service.rating,
        user: {
            id: service.user._id.toString(),
            name: (service.user as any).name,
            avatar: (service.user as any).avatar,
        }
    }));

    return NextResponse.json(formattedServices);
}

// POST a new service
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
        const { title, category, price, imageUrl } = body;

        if (!title || !category || !price || !imageUrl) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newService = new ServiceModel({
            title,
            category,
            price,
            imageUrl,
            user: userId,
        });

        await newService.save();
        
        // We need to populate the user to send it back in the correct format
        const createdService = await ServiceModel.findById(newService._id).populate({ path: 'user', model: UserModel, select: 'name avatar' });

        if (!createdService) {
          throw new Error('Service creation failed');
        }

        const responseService = {
           id: createdService._id.toString(),
            title: createdService.title,
            category: createdService.category,
            price: createdService.price,
            imageUrl: createdService.imageUrl,
            rating: createdService.rating,
            user: {
                id: createdService.user._id.toString(),
                name: (createdService.user as any).name,
                avatar: (createdService.user as any).avatar,
            }
        };

        return NextResponse.json(responseService, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating service' }, { status: 500 });
    }
}


'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { servicesData, type Service, type User } from '@/lib/data';
import { users } from '@/lib/users';
import { verifyJwt } from '@/lib/utils';


// GET all services
export async function GET() {
    // In a real app, you'd fetch from a DB
    return NextResponse.json(servicesData.sort((a, b) => b.id - a.id));
}

// POST a new service
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = verifyJwt(token);
     if (!decodedToken || !decodedToken.id) {
        return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const currentUserRecord = users.find(u => u.id === decodedToken.id);
    if (!currentUserRecord) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    try {
        const body = await request.json();
        const { title, category, price, imageUrl } = body;

        if (!title || !category || !price || !imageUrl) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const currentUser: User = {
            id: currentUserRecord.id,
            name: currentUserRecord.name,
            avatar: `https://avatar.vercel.sh/${currentUserRecord.email}`
        };

        const newService: Service = {
            id: servicesData.length + 1,
            title,
            category,
            price,
            imageUrl,
            rating: 0, // New services have no rating yet
            user: currentUser,
        };

        servicesData.push(newService);

        return NextResponse.json(newService, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating service' }, { status: 500 });
    }
}

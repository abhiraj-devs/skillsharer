
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { requestsData, type Request, type User } from '@/lib/data';
import { users } from '@/lib/users';
import { verifyJwt } from '@/lib/utils';

// GET all requests
export async function GET() {
    // In a real app, you'd fetch from a DB
    return NextResponse.json(requestsData.sort((a, b) => b.id - a.id));
}

// POST a new request
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
        const { title, description, budget, tags } = body;

        if (!title || !description || !budget || !tags) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }
        
        const currentUser: User = {
            id: currentUserRecord.id,
            name: currentUserRecord.name,
            avatar: `https://avatar.vercel.sh/${currentUserRecord.email}`
        };

        const newRequest: Request = {
            id: requestsData.length + 1,
            title,
            description,
            budget,
            tags: tags.split(',').map((tag: string) => tag.trim()),
            user: currentUser,
        };

        requestsData.push(newRequest);

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating request' }, { status: 500 });
    }
}

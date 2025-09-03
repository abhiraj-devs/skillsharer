
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ConversationModel from '@/models/Conversation';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

// POST a new conversation or get an existing one
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

    const senderId = new Types.ObjectId(decodedToken.id);

    try {
        const { recipientId } = await request.json();

        if (!recipientId) {
            return NextResponse.json({ message: 'Missing recipientId' }, { status: 400 });
        }

        const recipientObjectId = new Types.ObjectId(recipientId);

        if(senderId.toString() === recipientObjectId.toString()) {
            return NextResponse.json({ message: 'Cannot start conversation with yourself' }, { status: 400 });
        }
        
        // Find if a conversation already exists between the two users
        let conversation = await ConversationModel.findOne({
            participants: { $all: [senderId, recipientObjectId] }
        });

        if (conversation) {
            return NextResponse.json({ conversationId: conversation._id.toString() });
        }

        // If not, create a new one
        const newConversation = new ConversationModel({
            participants: [senderId, recipientObjectId],
            messages: [] 
        });

        await newConversation.save();

        return NextResponse.json({ conversationId: newConversation._id.toString() }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error starting conversation' }, { status: 500 });
    }
}

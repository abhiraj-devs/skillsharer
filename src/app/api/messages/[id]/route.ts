
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ConversationModel from '@/models/Conversation';
import UserModel from '@/models/User';
import { Types } from 'mongoose';


// GET a single conversation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const conversationId = params.id;

    try {
        const convo = await ConversationModel.findById(conversationId)
            .populate({ path: 'participants', model: UserModel, select: 'name avatar email' })
            .populate({ 
                path: 'messages.sender', 
                model: UserModel, 
                select: 'name avatar email' 
            });

        if (!convo) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }
        
        // Check if the current user is a participant
        if (!convo.participants.some((p: any) => p._id.equals(userId))) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const formattedConversation = {
            id: convo._id.toString(),
            participants: convo.participants.map((p: any) => ({
                id: p._id.toString(),
                name: p.name,
                avatar: p.avatar,
                email: p.email
            })),
            messages: convo.messages.map((msg: any) => ({
                id: msg._id.toString(),
                text: msg.text,
                senderId: msg.sender._id.toString(),
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            }))
        };


        return NextResponse.json(formattedConversation);
    } catch(error) {
         console.error(error);
        return NextResponse.json({ message: 'Error fetching conversation' }, { status: 500 });
    }
}
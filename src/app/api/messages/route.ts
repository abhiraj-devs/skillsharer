
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { conversationsData, type Message } from '@/lib/data';
import { verifyJwt } from '@/lib/utils';
import { users } from '@/lib/users';

// GET all conversations for the current user
export async function GET(request: NextRequest) {
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
    const userConversations = conversationsData.filter(convo => 
        convo.participants.some(p => p.id === userId)
    );

    return NextResponse.json(userConversations);
}

// POST a new message to a conversation
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

    const senderId = decodedToken.id;

    try {
        const { conversationId, text } = await request.json();

        if (!conversationId || !text) {
            return NextResponse.json({ message: 'Missing conversationId or text' }, { status: 400 });
        }

        const conversation = conversationsData.find(c => c.id === conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        // Check if user is part of the conversation
        if (!conversation.participants.some(p => p.id === senderId)) {
             return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const newMessage: Message = {
            id: Date.now(),
            text,
            senderId,
            isSender: false, // This is determined on client-side
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        conversation.messages.push(newMessage);

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
    }
}

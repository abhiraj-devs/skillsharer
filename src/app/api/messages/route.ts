
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ConversationModel from '@/models/Conversation';
import UserModel from '@/models/User';

// GET all conversations for the current user
export async function GET(request: NextRequest) {
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
    const conversations = await ConversationModel.find({ participants: userId })
        .populate({ path: 'participants', model: UserModel, select: 'name avatar email' })
        .populate({ path: 'messages.sender', model: UserModel, select: 'name avatar email' })
        .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(convo => ({
        id: convo._id.toString(),
        participants: convo.participants.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            avatar: p.avatar,
        })),
        messages: convo.messages.map((msg: any) => ({
            id: msg._id.toString(),
            text: msg.text,
            senderId: msg.sender._id.toString(),
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
            // isSender is a client-side concern
        }))
    }));


    return NextResponse.json(formattedConversations);
}

// POST a new message to a conversation
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

    const senderId = decodedToken.id;

    try {
        const { conversationId, text } = await request.json();

        if (!conversationId || !text) {
            return NextResponse.json({ message: 'Missing conversationId or text' }, { status: 400 });
        }

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        if (!conversation.participants.includes(senderId)) {
             return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const newMessage = {
            text,
            sender: senderId,
            timestamp: new Date(),
        };

        conversation.messages.push(newMessage as any);
        await conversation.save();

        const latestMessage = conversation.messages[conversation.messages.length - 1];

        return NextResponse.json({
            id: latestMessage._id.toString(),
            text: latestMessage.text,
            senderId: senderId,
            timestamp: new Date(latestMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
    }
}

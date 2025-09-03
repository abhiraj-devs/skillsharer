
'use server'
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import ConversationModel from '@/models/Conversation';
import UserModel from '@/models/User';
import { Types } from 'mongoose';

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
        .populate({ 
            path: 'messages.sender', 
            model: UserModel, 
            select: 'name avatar email' 
        })
        .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map(convo => ({
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

    const senderId = new Types.ObjectId(decodedToken.id);

    try {
        const { conversationId, text } = await request.json();

        if (!conversationId || !text) {
            return NextResponse.json({ message: 'Missing conversationId or text' }, { status: 400 });
        }

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        if (!conversation.participants.some(p => p.equals(senderId))) {
             return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const newMessage = {
            _id: new Types.ObjectId(),
            text,
            sender: senderId,
            timestamp: new Date(),
        };

        conversation.messages.push(newMessage as any);
        await conversation.save();
        
        return NextResponse.json({
            id: newMessage._id.toString(),
            text: newMessage.text,
            senderId: senderId.toString(),
            timestamp: new Date(newMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
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
        const { conversationId, messageId } = await request.json();

        if (!conversationId || !messageId) {
            return NextResponse.json({ message: 'Missing conversationId or messageId' }, { status: 400 });
        }

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }
        
        const messageIndex = conversation.messages.findIndex(m => m._id.toString() === messageId);
        if (messageIndex === -1) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }
        
        const message = conversation.messages[messageIndex];
        // Ensure the user deleting the message is the one who sent it
        if (message.sender.toString() !== userId.toString()) {
            return NextResponse.json({ message: 'Forbidden: You can only delete your own messages.' }, { status: 403 });
        }
        
        // Update message text instead of deleting the object
        conversation.messages[messageIndex].text = "This message was deleted";
        conversation.markModified('messages'); // Important: tell Mongoose the array has changed

        await conversation.save();
        
        return NextResponse.json({ success: true, messageId, conversationId });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting message' }, { status: 500 });
    }
}


import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IMessage extends Document {
    text: string;
    sender: Types.ObjectId | IUser;
    timestamp: Date;
}

const MessageSchema: Schema<IMessage> = new Schema({
    text: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});

export interface IConversation extends Document {
    participants: (Types.ObjectId | IUser)[];
    messages: IMessage[];
}

const ConversationSchema: Schema<IConversation> = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema]
}, { timestamps: true });


const ConversationModel: Model<IConversation> = models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export default ConversationModel;

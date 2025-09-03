
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IRequest extends Document {
    title: string;
    description: string;
    budget: number;
    tags: string[];
    user: Types.ObjectId | IUser;
    status: 'open' | 'fulfilled';
    solver?: Types.ObjectId | IUser;
    completedAt?: Date;
}

const RequestSchema: Schema<IRequest> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    tags: { type: [String], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'fulfilled'], default: 'open' },
    solver: { type: Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date }
}, { timestamps: true });

const RequestModel: Model<IRequest> = models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default RequestModel;

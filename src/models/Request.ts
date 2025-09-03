
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IRequest extends Document {
    title: string;
    description: string;
    budget: number;
    tags: string[];
    user: Types.ObjectId | IUser;
}

const RequestSchema: Schema<IRequest> = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    tags: { type: [String], required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const RequestModel: Model<IRequest> = models.Request || mongoose.model<IRequest>('Request', RequestSchema);

export default RequestModel;

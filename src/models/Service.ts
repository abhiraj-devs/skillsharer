
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IService extends Document {
    title: string;
    category: string;
    price: number;
    imageUrl: string;
    rating: number;
    user: Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema: Schema<IService> = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });


const ServiceModel: Model<IService> = models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default ServiceModel;

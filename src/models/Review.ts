
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import { IUser } from './User';

export interface IReview extends Document {
    _id: Types.ObjectId;
    rating: number;
    comment: string;
    user: Types.ObjectId | IUser; // The user being reviewed
    reviewer: Types.ObjectId | IUser; // The user who wrote the review
    createdAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });


const ReviewModel: Model<IReview> = models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel;

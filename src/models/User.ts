
import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  skills: string[];
  avatar: string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  skills: { type: [String], default: [] },
  avatar: { type: String }
});

// Pre-save hook to generate avatar URL
UserSchema.pre<IUser>('save', function (next) {
    if (!this.avatar) {
        this.avatar = `https://avatar.vercel.sh/${this.email}`;
    }
    if (!this.name) {
        this.name = this.email.split('@')[0];
    }
    next();
});

const UserModel: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;

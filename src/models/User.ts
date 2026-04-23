import mongoose, { Schema, model, models, Document } from 'mongoose';

export type UserRole = 'admin' | 'staff';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>({
  username:     { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, required: true },
  role:         { type: String, enum: ['admin', 'staff'], default: 'staff' },
});

export const User = models.User || model<IUser>('User', userSchema);

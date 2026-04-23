import { Schema, model, models, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  nameAr: string;
  price: number;
  duration: number; // minutes
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name:        { type: String, required: true, trim: true },
    nameAr:      { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    duration:    { type: Number, required: true, min: 5, default: 30 },
    category:    { type: String, required: true, default: 'General' },
    description: { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = models.Service || model<IService>('Service', serviceSchema);

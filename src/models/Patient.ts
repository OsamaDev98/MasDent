import { Schema, model, models, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
  notes?: string;
  lastVisit?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
    lastVisit: { type: String, default: '' },
  },
  { timestamps: true }
);

// Text index for search
patientSchema.index({ name: 'text', phone: 'text', email: 'text' });

export const Patient = models.Patient || model<IPatient>('Patient', patientSchema);

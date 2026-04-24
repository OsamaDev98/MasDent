import mongoose, { Schema, model, models, Document } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface IAppointment extends Document {
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  service: string;
  notes?: string;
  status: AppointmentStatus;
  patientId?: mongoose.Types.ObjectId;
  paymentStatus?: 'unpaid' | 'paid';
  paymentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, trim: true, lowercase: true },
    phone:         { type: String, required: true, trim: true },
    date:          { type: String, required: true },
    time:          { type: String, default: '' },
    service:       { type: String, required: true },
    notes:         { type: String, default: '' },
    status:        { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'], default: 'pending' },
    patientId:     { type: Schema.Types.ObjectId, ref: 'Patient', default: null },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paymentNotes:  { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for the most common dashboard query patterns
appointmentSchema.index({ status: 1, createdAt: -1 });          // filter by status
appointmentSchema.index({ date: 1 });                            // filter by date
appointmentSchema.index({ createdAt: -1 });                      // default sort
appointmentSchema.index({ paymentStatus: 1, createdAt: -1 });    // finance page
appointmentSchema.index({ patientId: 1 });                       // patient history
appointmentSchema.index({ phone: 1 });                           // patient lookup by phone

export const Appointment =
  models.Appointment || model<IAppointment>('Appointment', appointmentSchema);

import { Schema, model, models, Document } from 'mongoose';

export interface ISettings extends Document {
  clinicName:   string;
  clinicNameAr: string;
  phone:        string;
  email:        string;
  whatsapp?:    string;
  address:      string;
  addressAr:    string;
  workStart:    string;
  workEnd:      string;
  workDays:     string[];
  breakStart?:  string;
  breakEnd?:    string;
  notifications: {
    reminder_24h: boolean;
    new_appt:     boolean;
    cancellation: boolean;
    no_show:      boolean;
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    clinicName:   { type: String, default: 'Mas Dent' },
    clinicNameAr: { type: String, default: 'ماس دينت' },
    phone:        { type: String, default: '' },
    email:        { type: String, default: '' },
    whatsapp:     { type: String, default: '' },
    address:      { type: String, default: '' },
    addressAr:    { type: String, default: '' },
    workStart:    { type: String, default: '09:00' },
    workEnd:      { type: String, default: '18:00' },
    workDays:     { type: [String], default: ['Sunday','Monday','Tuesday','Wednesday','Thursday'] },
    breakStart:   { type: String, default: '13:00' },
    breakEnd:     { type: String, default: '14:00' },
    notifications: {
      reminder_24h: { type: Boolean, default: true },
      new_appt:     { type: Boolean, default: true },
      cancellation: { type: Boolean, default: false },
      no_show:      { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Settings = models.Settings || model<ISettings>('Settings', settingsSchema);

// Shared client-side types and event emitter
// Actual data storage is now handled via MongoDB API routes

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  service: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

/** Fired in the browser whenever a new appointment is submitted from the form on the same tab */
export const APPOINTMENT_EVENT = 'masdent:new-appointment';

export function emitNewAppointment(appt: Appointment): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APPOINTMENT_EVENT, { detail: appt }));
  }
}

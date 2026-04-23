import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Patient } from '@/models/Patient';
import { User } from '@/models/User';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (payload.role !== 'admin') throw new Error('Forbidden');
  return payload;
}

// GET /api/analytics — admin only
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // All appointments
    const allAppts = await Appointment.find().lean();
    const totalAppointments = allAppts.length;
    const pending = allAppts.filter(a => a.status === 'pending').length;
    const confirmed = allAppts.filter(a => a.status === 'confirmed').length;
    const completed = allAppts.filter(a => a.status === 'completed').length;
    const cancelled = allAppts.filter(a => a.status === 'cancelled').length;
    const noShow = allAppts.filter(a => a.status === 'no-show').length;

    // This month
    const thisMonth = allAppts.filter(a => new Date(a.createdAt) >= startOfMonth);
    const lastMonth = allAppts.filter(a => {
      const d = new Date(a.createdAt);
      return d >= startOfLastMonth && d <= endOfLastMonth;
    });

    // Revenue (paid appointments)
    const paidAppts = allAppts.filter(a => a.paymentStatus === 'paid');

    // Most booked services
    const serviceCounts: Record<string, number> = {};
    allAppts.forEach(a => {
      serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toISOString().split('T')[0];
      const count = allAppts.filter(a => (a.createdAt as Date).toISOString().split('T')[0] === dayStr).length;
      last7Days.push({ date: dayStr, count });
    }

    // Patients
    const totalPatients = await Patient.countDocuments();
    const newPatientsThisMonth = await Patient.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Staff
    const totalStaff = await User.countDocuments({ role: 'staff' });

    // No-show rate
    const noShowRate = totalAppointments > 0 ? Math.round((noShow / totalAppointments) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalAppointments,
        thisMonthAppointments: thisMonth.length,
        lastMonthAppointments: lastMonth.length,
        pending, confirmed, completed, cancelled, noShow,
        paidCount: paidAppts.length,
        noShowRate,
        totalPatients,
        newPatientsThisMonth,
        totalStaff,
      },
      topServices,
      last7Days,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

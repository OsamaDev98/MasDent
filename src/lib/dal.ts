/**
 * Data Access Layer (DAL)
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-only module. Import ONLY from Server Components or API routes.
 * Never import from "use client" files.
 *
 * All functions connect to DB, run queries, and return plain serialisable objects
 * so they can be safely passed as props to Client Components.
 */
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Patient } from '@/models/Patient';
import { User } from '@/models/User';
import { AUTH_COOKIE } from '@/lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  overview: {
    totalAppointments: number;
    thisMonthAppointments: number;
    lastMonthAppointments: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
    paidCount: number;
    noShowRate: number;
    totalPatients: number;
    newPatientsThisMonth: number;
    totalStaff: number;
  };
  topServices: { name: string; count: number }[];
  last7Days: { date: string; count: number }[];
}

export interface StaffOverviewData {
  appointments: SerializedAppointment[];
  todayStr: string;
}

export interface SerializedAppointment {
  _id: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time?: string;
  status: string;
  paymentStatus?: string;
}

export interface CurrentUser {
  userId: string;
  username: string;
  name: string;
  role: string;
}

// ── Auth helper ───────────────────────────────────────────────────────────────

/**
 * Read and verify the auth cookie from the current request.
 * Returns the JWT payload or null if missing/invalid.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;
    return await verifyToken(token) as CurrentUser;
  } catch {
    return null;
  }
}

// ── Analytics (Admin) ─────────────────────────────────────────────────────────

export async function getAnalyticsData(): Promise<AnalyticsData> {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // ── Status counts + top services via single aggregation ──
  const statusAgg = await Appointment.aggregate([
    {
      $facet: {
        overall: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        thisMonth: [
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $count: 'count' },
        ],
        lastMonth: [
          { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
          { $count: 'count' },
        ],
        paidCount: [
          { $match: { paymentStatus: 'paid' } },
          { $count: 'count' },
        ],
        topServices: [
          { $group: { _id: '$service', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, name: '$_id', count: 1 } },
        ],
      },
    },
  ]);

  const fac = statusAgg[0];
  const statusMap: Record<string, number> = {};
  for (const s of fac.overall) statusMap[s._id] = s.count;
  const totalAppointments = Object.values(statusMap).reduce(
    (a: number, b) => a + (b as number),
    0,
  );

  // ── Last 7 days trend ──
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trendAgg = await Appointment.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trendMap: Record<string, number> = {};
  for (const t of trendAgg) trendMap[t._id] = t.count;
  const last7Days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split('T')[0];
    last7Days.push({ date: key, count: trendMap[key] ?? 0 });
  }

  // ── Patient + staff counts ──
  const [totalPatients, newPatientsThisMonth, totalStaff] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'staff' }),
  ]);

  const noShow = statusMap['no-show'] ?? 0;
  const noShowRate =
    totalAppointments > 0 ? Math.round((noShow / totalAppointments) * 100) : 0;

  return {
    overview: {
      totalAppointments,
      thisMonthAppointments: fac.thisMonth[0]?.count ?? 0,
      lastMonthAppointments: fac.lastMonth[0]?.count ?? 0,
      pending: statusMap['pending'] ?? 0,
      confirmed: statusMap['confirmed'] ?? 0,
      completed: statusMap['completed'] ?? 0,
      cancelled: statusMap['cancelled'] ?? 0,
      noShow,
      paidCount: fac.paidCount[0]?.count ?? 0,
      noShowRate,
      totalPatients,
      newPatientsThisMonth,
      totalStaff,
    },
    topServices: fac.topServices,
    last7Days,
  };
}

// ── Staff Overview ────────────────────────────────────────────────────────────

export async function getStaffOverviewData(): Promise<StaffOverviewData> {
  await connectDB();

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch all appointments — staff sees everything for today + recent context
  const raw = await Appointment.find({})
    .sort({ createdAt: -1 })
    .select('name phone service date time status paymentStatus')
    .lean();

  // Serialise: convert ObjectId → string, Date → ISO string
  const appointments: SerializedAppointment[] = raw.map((a) => ({
    _id: (a._id as { toString(): string }).toString(),
    name: a.name,
    phone: a.phone,
    service: a.service,
    date: a.date,
    time: a.time ?? undefined,
    status: a.status,
    paymentStatus: a.paymentStatus ?? undefined,
  }));

  return { appointments, todayStr };
}

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
    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // ── 1. Status counts via aggregation (no full collection load) ──
    const statusAgg = await Appointment.aggregate([
      {
        $facet: {
          overall: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
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
    const totalAppointments = Object.values(statusMap).reduce((a: number, b) => a + (b as number), 0);

    // ── 2. Last 7 days trend via aggregation ──
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

    // Build a full 7-day array, filling 0 for missing days
    const trendMap: Record<string, number> = {};
    for (const t of trendAgg) trendMap[t._id] = t.count;
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      last7Days.push({ date: key, count: trendMap[key] ?? 0 });
    }

    // ── 3. Patients & staff counts ──
    const [totalPatients, newPatientsThisMonth, totalStaff] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ role: 'staff' }),
    ]);

    const noShow  = statusMap['no-show'] ?? 0;
    const noShowRate = totalAppointments > 0 ? Math.round((noShow / totalAppointments) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalAppointments,
        thisMonthAppointments: fac.thisMonth[0]?.count ?? 0,
        lastMonthAppointments: fac.lastMonth[0]?.count ?? 0,
        pending:   statusMap['pending']   ?? 0,
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
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === 'Forbidden')  return NextResponse.json({ error: 'Forbidden' },     { status: 403 });
    if (e instanceof Error && e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    console.error('[GET /api/analytics]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

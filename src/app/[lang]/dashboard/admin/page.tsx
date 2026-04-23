"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Analytics {
  overview: {
    totalAppointments: number; thisMonthAppointments: number; lastMonthAppointments: number;
    pending: number; confirmed: number; completed: number; cancelled: number; noShow: number;
    paidCount: number; noShowRate: number; totalPatients: number; newPatientsThisMonth: number; totalStaff: number;
  };
  topServices: { name: string; count: number }[];
  last7Days: { date: string; count: number }[];
}

/* ── Premium Bar Chart ── */
function BarChart({ data, isAr }: { data: { date: string; count: number }[]; isAr: boolean }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-36 pt-4 relative">
      {/* Y-axis guide lines */}
      {[0.25, 0.5, 0.75, 1].map(p => (
        <div key={p} className="absolute left-0 right-0 border-t border-dashed border-slate-100"
          style={{ bottom: `${p * 100}%` }} />
      ))}
      {data.map((d, i) => {
        const heightPct = max > 0 ? (d.count / max) * 100 : 0;
        const dayLabel = new Date(d.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                {d.count} {isAr ? 'موعد' : 'appts'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
            {/* Bar */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: `${Math.max(heightPct, 4)}%`, transformOrigin: 'bottom' }}
              className="w-full rounded-t-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-teal-600 to-teal-400 group-hover:from-teal-500 group-hover:to-teal-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </motion.div>
            <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">
              {dayLabel.slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut-style status ring ── */
function StatusRing({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const r = 16, circ = 2 * Math.PI * r;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
      <motion.circle
        cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

export default function AdminAnalyticsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/analytics');
      if (!r.ok) return;
      setData(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const o = data?.overview;
  const monthChange = o ? (o.lastMonthAppointments > 0
    ? Math.round((o.thisMonthAppointments - o.lastMonthAppointments) / o.lastMonthAppointments * 100)
    : 0) : 0;

  const kpi = o ? [
    {
      icon: 'calendar_month', gradient: 'from-teal-500 to-teal-600', shadow: 'shadow-teal-200',
      value: o.totalAppointments, label: isAr ? 'إجمالي المواعيد' : 'Total Appointments',
      sub: isAr ? `${o.thisMonthAppointments} هذا الشهر` : `${o.thisMonthAppointments} this month`,
      change: monthChange, positive: true,
    },
    {
      icon: 'group', gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200',
      value: o.totalPatients, label: isAr ? 'إجمالي المرضى' : 'Total Patients',
      sub: isAr ? `+${o.newPatientsThisMonth} جديد` : `+${o.newPatientsThisMonth} new`,
      change: o.newPatientsThisMonth, positive: true,
    },
    {
      icon: 'task_alt', gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-200',
      value: o.completed, label: isAr ? 'مواعيد مكتملة' : 'Completed',
      sub: isAr
        ? `${o.totalAppointments > 0 ? Math.round(o.completed / o.totalAppointments * 100) : 0}% من الإجمالي`
        : `${o.totalAppointments > 0 ? Math.round(o.completed / o.totalAppointments * 100) : 0}% of total`,
      change: null, positive: true,
    },
    {
      icon: 'badge', gradient: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-200',
      value: o.totalStaff, label: isAr ? 'أعضاء الفريق' : 'Staff Members',
      sub: isAr ? `${o.paidCount} دفعة مسجلة` : `${o.paidCount} paid records`,
      change: null, positive: true,
    },
  ] : [];

  const statusRows = o ? [
    { label: isAr ? 'قيد الانتظار' : 'Pending', value: o.pending, color: '#f59e0b', ringColor: '#f59e0b' },
    { label: isAr ? 'مؤكد' : 'Confirmed', value: o.confirmed, color: '#14b8a6', ringColor: '#14b8a6' },
    { label: isAr ? 'مكتمل' : 'Completed', value: o.completed, color: '#10b981', ringColor: '#10b981' },
    { label: isAr ? 'ملغى' : 'Cancelled', value: o.cancelled, color: '#f87171', ringColor: '#f87171' },
    { label: isAr ? 'غياب' : 'No-show', value: o.noShow, color: '#94a3b8', ringColor: '#94a3b8' },
  ] : [];

  return (
    <DashboardShell
      title={t('analytics') || (isAr ? 'لوحة التحليلات' : 'Analytics Overview')}
      subtitle={t('analytics_subtitle') || (isAr ? 'إحصائيات وأداء العيادة' : 'Clinic performance and insights')}
      actions={
        <Button onClick={load} variant="outline" className="gap-2 rounded-xl font-semibold">
          <span className="material-symbols-outlined text-sm">refresh</span>
          {t('refresh') || (isAr ? 'تحديث' : 'Refresh')}
        </Button>
      }
    >
      {loading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-5 mb-5">
            <Skeleton className="lg:col-span-2 h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <Skeleton className="lg:col-span-2 h-52 rounded-3xl" />
            <Skeleton className="h-52 rounded-3xl" />
          </div>
        </>
      ) : !data ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center py-16">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">error</span>
          <p className="text-slate-500 font-medium">{isAr ? 'تعذر تحميل البيانات' : 'Failed to load analytics'}</p>
          <button onClick={load} className="mt-4 text-sm text-teal-600 font-bold hover:underline">{isAr ? 'حاول مجدداً' : 'Try again'}</button>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpi.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div className={`bg-white rounded-3xl p-5 border border-slate-100 shadow-md ${k.shadow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-md mb-4`}>
                    <span className="material-symbols-outlined text-white text-xl">{k.icon}</span>
                  </div>
                  {/* Value */}
                  <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{k.value}</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1.5">{k.label}</p>
                  {/* Sub + trend */}
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50">
                    {k.change !== null && k.change !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${k.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-xs">{k.change > 0 ? 'trending_up' : 'trending_down'}</span>
                        {Math.abs(k.change)}%
                      </span>
                    )}
                    <p className="text-[11px] text-slate-400 truncate">{k.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Row 2: Chart + Status ── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-5">
            {/* Bar chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-slate-900">{isAr ? 'مواعيد آخر 7 أيام' : 'Last 7 Days Trend'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'عدد الحجوزات الجديدة يومياً' : 'Daily new bookings'}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-teal-400 to-teal-600" />
                  <span className="text-[11px] font-bold text-teal-700">{isAr ? 'المواعيد' : 'Appointments'}</span>
                </div>
              </div>
              <BarChart data={data.last7Days} isAr={isAr} />
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-1">{isAr ? 'توزيع الحالات' : 'Status Breakdown'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'من إجمالي المواعيد' : `From ${o!.totalAppointments} total`}</p>
              <div className="space-y-4">
                {statusRows.map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <StatusRing value={s.value} total={o!.totalAppointments} color={s.ringColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{s.label}</span>
                        <span className="text-sm font-black text-slate-900">{s.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: s.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${o!.totalAppointments > 0 ? (s.value / o!.totalAppointments) * 100 : 0}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 3: Top Services + Quick Stats ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Top services */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-1">{isAr ? 'الخدمات الأكثر طلباً' : 'Top Services'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'الخدمات الأعلى حجزاً' : 'Most booked services'}</p>
              {data.topServices.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">medical_services</span>
                  <p className="text-slate-400 text-sm">{isAr ? 'لا توجد بيانات بعد' : 'No service data yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((s, i) => {
                    const max = data.topServices[0]?.count ?? 1;
                    const pctVal = Math.round((s.count / max) * 100);
                    const colors = ['from-teal-500 to-teal-600', 'from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-red-500'];
                    return (
                      <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm font-semibold text-slate-800 truncate">{s.name}</span>
                              <span className="text-sm font-black text-slate-900 shrink-0 ml-2">{s.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pctVal}%` }}
                                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 mb-1">{isAr ? 'إحصائيات سريعة' : 'Quick Snapshot'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'أرقام رئيسية' : 'Key numbers at a glance'}</p>
              <div className="space-y-3">
                {[
                  { icon: 'pending_actions', label: isAr ? 'قيد الانتظار' : 'Pending', value: o!.pending, bg: 'bg-amber-50', text: 'text-amber-600' },
                  { icon: 'payments', label: isAr ? 'مدفوعات' : 'Paid', value: o!.paidCount, bg: 'bg-teal-50', text: 'text-teal-600' },
                  { icon: 'event_busy', label: isAr ? 'ملغى' : 'Cancelled', value: o!.cancelled, bg: 'bg-red-50', text: 'text-red-500' },
                  { icon: 'person_off', label: isAr ? 'غياب' : 'No-shows', value: o!.noShow, bg: 'bg-slate-50', text: 'text-slate-500' },
                  { icon: 'speed', label: isAr ? 'معدل الغياب' : 'No-show Rate', value: `${o!.noShowRate}%`, bg: 'bg-orange-50', text: 'text-orange-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-base ${s.text}`}>{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    </div>
                    <p className="font-black text-slate-900 text-lg">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

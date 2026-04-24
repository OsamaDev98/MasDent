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

/* ── Animated Bar Chart ── */
function BarChart({ data, isAr }: { data: { date: string; count: number }[]; isAr: boolean }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-40 pt-4 relative">
      {[0.25, 0.5, 0.75, 1].map(p => (
        <div key={p} className="absolute left-0 right-0 border-t border-dashed border-slate-100/80"
          style={{ bottom: `${p * 100}%` }} />
      ))}
      {data.map((d, i) => {
        const heightPct = max > 0 ? (d.count / max) * 100 : 0;
        const dayLabel = new Date(d.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl">
                {d.count} {isAr ? 'موعد' : 'appts'}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
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

/* ── SVG Status Ring ── */
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

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

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
      icon: 'calendar_month', gradient: 'from-teal-500 to-teal-600', glow: 'shadow-teal-500/25',
      value: o.totalAppointments, label: isAr ? 'إجمالي المواعيد' : 'Total Appointments',
      sub: isAr ? `${o.thisMonthAppointments} هذا الشهر` : `${o.thisMonthAppointments} this month`,
      change: monthChange,
    },
    {
      icon: 'group', gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/25',
      value: o.totalPatients, label: isAr ? 'إجمالي المرضى' : 'Total Patients',
      sub: isAr ? `+${o.newPatientsThisMonth} جديد` : `+${o.newPatientsThisMonth} new this month`,
      change: o.newPatientsThisMonth,
    },
    {
      icon: 'task_alt', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/25',
      value: o.completed, label: isAr ? 'مواعيد مكتملة' : 'Completed',
      sub: isAr
        ? `${o.totalAppointments > 0 ? Math.round(o.completed / o.totalAppointments * 100) : 0}% من الإجمالي`
        : `${o.totalAppointments > 0 ? Math.round(o.completed / o.totalAppointments * 100) : 0}% of total`,
      change: null,
    },
    {
      icon: 'badge', gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/25',
      value: o.totalStaff, label: isAr ? 'أعضاء الفريق' : 'Staff Members',
      sub: isAr ? `${o.paidCount} دفعة مسجلة` : `${o.paidCount} paid records`,
      change: null,
    },
  ] : [];

  const statusRows = o ? [
    { label: isAr ? 'قيد الانتظار' : 'Pending',   value: o.pending,   color: '#f59e0b' },
    { label: isAr ? 'مؤكد'         : 'Confirmed',  value: o.confirmed, color: '#14b8a6' },
    { label: isAr ? 'مكتمل'        : 'Completed',  value: o.completed, color: '#10b981' },
    { label: isAr ? 'ملغى'         : 'Cancelled',  value: o.cancelled, color: '#f87171' },
    { label: isAr ? 'غياب'         : 'No-show',    value: o.noShow,    color: '#94a3b8' },
  ] : [];

  return (
    <DashboardShell
      title={t('analytics') || (isAr ? 'لوحة التحليلات' : 'Analytics Overview')}
      subtitle={t('analytics_subtitle') || (isAr ? 'إحصائيات وأداء العيادة' : 'Clinic performance and real-time insights')}
      actions={
        <Button
          onClick={load}
          variant="outline"
          className="gap-2 rounded-xl font-semibold bg-white/15 border-white/30 text-white hover:bg-white/25 hover:text-white backdrop-blur-sm"
        >
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-red-300">error</span>
          </div>
          <p className="font-bold text-slate-700 text-lg mb-1">{isAr ? 'تعذر تحميل البيانات' : 'Failed to load analytics'}</p>
          <p className="text-slate-400 text-sm mb-5">{isAr ? 'يرجى المحاولة مرة أخرى' : 'Please try again'}</p>
          <button onClick={load} className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/25">
            {isAr ? 'حاول مجدداً' : 'Try Again'}
          </button>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpi.map((k, i) => (
              <motion.div key={k.label} {...fadeUp(i)}>
                <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${k.glow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group`}>
                  {/* Subtle corner glow */}
                  <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${k.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${k.gradient} flex items-center justify-center shadow-lg mb-4`}>
                    <span className="material-symbols-outlined text-white text-xl">{k.icon}</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{k.value}</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1.5 truncate">{k.label}</p>
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-50">
                    {k.change !== null && k.change !== 0 && (
                      <span className={`flex items-center gap-0.5 text-xs font-bold shrink-0 ${k.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
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
            <motion.div {...fadeUp(4)} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{isAr ? 'مواعيد آخر 7 أيام' : 'Last 7 Days Trend'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'عدد الحجوزات الجديدة يومياً' : 'Daily new bookings'}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100">
                  <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-teal-400 to-teal-600" />
                  <span className="text-[11px] font-bold text-teal-700">{isAr ? 'المواعيد' : 'Appointments'}</span>
                </div>
              </div>
              <BarChart data={data.last7Days} isAr={isAr} />
            </motion.div>

            {/* Status Breakdown */}
            <motion.div {...fadeUp(5)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-black text-slate-900 text-base mb-0.5">{isAr ? 'توزيع الحالات' : 'Status Breakdown'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'من إجمالي المواعيد' : `From ${o!.totalAppointments} total`}</p>
              <div className="space-y-4">
                {statusRows.map((s, i) => (
                  <motion.div key={s.label} className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
                    <StatusRing value={s.value} total={o!.totalAppointments} color={s.color} />
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Row 3: Top Services + Quick Stats ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Top services */}
            <motion.div {...fadeUp(6)} className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-black text-slate-900 text-base mb-0.5">{isAr ? 'الخدمات الأكثر طلباً' : 'Top Services'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'الخدمات الأعلى حجزاً' : 'Most booked services this period'}</p>
              {data.topServices.length === 0 ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-3xl text-slate-300">medical_services</span>
                  </div>
                  <p className="text-slate-400 text-sm font-medium">{isAr ? 'لا توجد بيانات بعد' : 'No service data yet'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((s, i) => {
                    const max = data.topServices[0]?.count ?? 1;
                    const pctVal = Math.round((s.count / max) * 100);
                    const colors = ['from-teal-500 to-teal-600', 'from-blue-500 to-indigo-500', 'from-violet-500 to-purple-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-red-500'];
                    const textColors = ['text-teal-700', 'text-blue-700', 'text-violet-700', 'text-amber-700', 'text-rose-700'];
                    const bgColors = ['bg-teal-50', 'bg-blue-50', 'bg-violet-50', 'bg-amber-50', 'bg-rose-50'];
                    return (
                      <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <div className="flex items-center gap-3 group">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm font-semibold text-slate-800 truncate">{s.name}</span>
                              <span className={`text-xs font-black shrink-0 ml-2 px-2 py-0.5 rounded-lg ${bgColors[i % bgColors.length]} ${textColors[i % textColors.length]}`}>{s.count}</span>
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
            </motion.div>

            {/* Quick Stats */}
            <motion.div {...fadeUp(7)} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-black text-slate-900 text-base mb-0.5">{isAr ? 'إحصائيات سريعة' : 'Quick Snapshot'}</h3>
              <p className="text-xs text-slate-400 mb-5">{isAr ? 'أرقام رئيسية' : 'Key numbers at a glance'}</p>
              <div className="space-y-2.5">
                {[
                  { icon: 'pending_actions', label: isAr ? 'قيد الانتظار' : 'Pending',    value: o!.pending,     bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100' },
                  { icon: 'payments',        label: isAr ? 'مدفوعات'     : 'Paid',         value: o!.paidCount,   bg: 'bg-teal-50',    text: 'text-teal-600',    ring: 'ring-teal-100'  },
                  { icon: 'event_busy',      label: isAr ? 'ملغى'        : 'Cancelled',    value: o!.cancelled,   bg: 'bg-red-50',     text: 'text-red-500',     ring: 'ring-red-100'   },
                  { icon: 'person_off',      label: isAr ? 'غياب'        : 'No-shows',     value: o!.noShow,      bg: 'bg-slate-50',   text: 'text-slate-500',   ring: 'ring-slate-100' },
                  { icon: 'speed',           label: isAr ? 'معدل الغياب' : 'No-show Rate', value: `${o!.noShowRate}%`, bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100' },
                ].map((s, i) => (
                  <motion.div key={s.label} className={`flex items-center gap-3 p-3 rounded-2xl border ring-1 ${s.ring} border-transparent hover:border-slate-100 transition-colors group`}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06 }}>
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-lg ${s.text}`}>{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                    </div>
                    <p className="font-black text-slate-900 text-xl tabular-nums">{s.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}

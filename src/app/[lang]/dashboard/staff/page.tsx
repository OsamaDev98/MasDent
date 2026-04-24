"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface Appointment {
  _id: string; name: string; phone: string; service: string;
  date: string; time?: string; status: string; paymentStatus?: string;
}

const STATUS_CFG = {
  pending:   { label: 'Pending',   labelAr: 'انتظار', color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200', dot: 'bg-amber-400',   icon: 'schedule' },
  confirmed: { label: 'Confirmed', labelAr: 'مؤكد',   color: 'text-teal-600',    bg: 'bg-teal-50',    border: 'border-teal-200',  dot: 'bg-teal-500',    icon: 'check_circle' },
  completed: { label: 'Completed', labelAr: 'مكتمل',  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: 'task_alt' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغى',   color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',   dot: 'bg-red-400',     icon: 'cancel' },
  'no-show': { label: 'No-show',   labelAr: 'غائب',   color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200', dot: 'bg-slate-400',   icon: 'person_off' },
} as const;

function getGreeting(isAr: boolean) {
  const h = new Date().getHours();
  if (h < 12) return isAr ? 'صباح الخير' : 'Good morning';
  if (h < 17) return isAr ? 'مساء الخير' : 'Good afternoon';
  return isAr ? 'مساء النور' : 'Good evening';
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

export default function StaffOverviewPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/appointments');
      const j = await r.json();
      setAppts(j.appointments ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today     = appts.filter(a => a.date === todayStr);
  const pending   = appts.filter(a => a.status === 'pending').length;
  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const completed = appts.filter(a => a.status === 'completed').length;
  const todayQueue = today.filter(a => a.status === 'confirmed' || a.status === 'pending');

  const stats = [
    { icon: 'today',        label: isAr ? 'مواعيد اليوم' : "Today's Appts",  value: today.length,  gradient: 'from-teal-500 to-teal-600',    glow: 'shadow-teal-500/20' },
    { icon: 'schedule',     label: isAr ? 'قيد الانتظار' : 'Pending',         value: pending,       gradient: 'from-amber-400 to-orange-500',  glow: 'shadow-amber-500/20' },
    { icon: 'check_circle', label: isAr ? 'مؤكد'         : 'Confirmed',       value: confirmed,     gradient: 'from-blue-500 to-indigo-500',   glow: 'shadow-blue-500/20' },
    { icon: 'task_alt',     label: isAr ? 'مكتمل'        : 'Completed',       value: completed,     gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/20' },
  ];

  const quickActions = [
    { icon: 'add_circle',  label: isAr ? 'موعد جديد'      : 'New Appointment', href: `/${lang}/dashboard/staff/appointments`, gradient: 'from-teal-500 to-teal-600',    glow: 'shadow-teal-500/20',    light: 'bg-teal-50',    text: 'text-teal-700' },
    { icon: 'person_add',  label: isAr ? 'مريض جديد'      : 'New Patient',     href: `/${lang}/dashboard/staff/patients`,     gradient: 'from-blue-500 to-indigo-600',  glow: 'shadow-blue-500/20',    light: 'bg-blue-50',    text: 'text-blue-700' },
    { icon: 'payment',     label: isAr ? 'تسجيل دفع'      : 'Record Payment',  href: `/${lang}/dashboard/staff/payments`,     gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/20', light: 'bg-emerald-50', text: 'text-emerald-700' },
    { icon: 'queue',       label: isAr ? 'قائمة الانتظار' : 'Live Queue',      href: `/${lang}/dashboard/staff/queue`,        gradient: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/20',  light: 'bg-violet-50',  text: 'text-violet-700' },
  ];

  return (
    <DashboardShell
      title={`${getGreeting(isAr)} 👋`}
      subtitle={
        loading
          ? (isAr ? 'جارٍ التحميل…' : 'Loading…')
          : isAr
            ? `لديك ${today.length} موعد اليوم — ${pending} قيد الانتظار`
            : `${today.length} appointment${today.length !== 1 ? 's' : ''} today — ${pending} pending`
      }
    >
      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i)}>
            {loading ? (
              <Skeleton className="h-32 rounded-3xl" />
            ) : (
              <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${s.glow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-default`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg mb-4`}>
                  <span className="material-symbols-outlined text-white text-xl">{s.icon}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 leading-none tabular-nums">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1.5">{s.label}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* ── Today's Appointments ── */}
        <motion.div {...fadeUp(4)} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div>
              <h3 className="font-black text-slate-900">{isAr ? "مواعيد اليوم" : "Today's Appointments"}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <a
              href={`/${lang}/dashboard/staff/appointments`}
              className="flex items-center gap-1 text-xs text-teal-600 font-bold hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 hover:bg-teal-100"
            >
              {isAr ? 'عرض الكل' : 'View all'}
              <span className={`material-symbols-outlined text-sm ${isAr ? 'rotate-180' : ''}`}>chevron_right</span>
            </a>
          </div>

          <div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : today.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300">event_available</span>
                </div>
                <p className="font-bold text-slate-600">{isAr ? 'لا توجد مواعيد اليوم' : 'No appointments today'}</p>
                <p className="text-xs text-slate-400 mt-1">{isAr ? 'استمتع بيومك!' : 'Enjoy your day!'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {today.map((a, i) => {
                  const cfg = STATUS_CFG[a.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                  return (
                    <motion.div
                      key={a._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Rank circle */}
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 shrink-0">
                        {i + 1}
                      </div>
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm shadow-teal-200 group-hover:scale-105 transition-transform">
                        {a.name[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{a.name}</p>
                        <p className="text-xs text-slate-400 truncate">{a.service}</p>
                      </div>
                      {a.time && (
                        <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
                          <span className="text-xs font-bold text-slate-600">{a.time}</span>
                        </div>
                      )}
                      {/* Status badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {isAr ? cfg.labelAr : cfg.label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Live Queue ── */}
        <motion.div {...fadeUp(5)} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <div>
              <h3 className="font-black text-slate-900">{isAr ? 'قائمة الانتظار' : 'Live Queue'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{isAr ? 'المرضى الحاليون' : 'Active patients'}</p>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-black ${todayQueue.length > 0 ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
              {todayQueue.length}
            </div>
          </div>

          <div className="p-4 space-y-2 flex-1">
            {todayQueue.length === 0 ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-3xl text-slate-300">how_to_reg</span>
                </div>
                <p className="text-sm font-bold text-slate-500">{isAr ? 'قائمة الانتظار فارغة' : 'Queue is empty'}</p>
              </div>
            ) : todayQueue.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  i === 0
                    ? 'bg-gradient-to-r from-teal-50 to-teal-50/50 border-teal-200 shadow-sm'
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  i === 0 ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{a.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{a.service}</p>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-black text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                    {isAr ? 'التالي' : 'NEXT'}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="px-4 pb-4 mt-auto">
            <a
              href={`/${lang}/dashboard/staff/queue`}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-bold shadow-md shadow-teal-200 hover:shadow-teal-300 hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">queue</span>
              {isAr ? 'إدارة قائمة الانتظار' : 'Manage Queue'}
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(6)}>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-black text-slate-700 text-sm">{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <motion.div key={a.label} {...fadeUp(7 + i)}>
              <a
                href={a.href}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer overflow-hidden relative"
              >
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${a.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.gradient} shadow-lg ${a.glow} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-2xl text-white">{a.icon}</span>
                </div>
                <p className="text-xs font-bold text-slate-700 text-center leading-tight">{a.label}</p>
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardShell>
  );
}

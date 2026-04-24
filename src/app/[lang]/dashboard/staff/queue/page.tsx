"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface QueuePatient {
  _id: string; name: string; service: string; phone: string;
  time?: string; status: string;
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

export default function StaffQueuePage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [allToday, setAllToday] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const todayStr = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/appointments?date=${todayStr}`);
      const j = await r.json();
      const appts: QueuePatient[] = (j.appointments ?? []).filter(
        (a: QueuePatient) => a.status === 'confirmed' || a.status === 'pending'
      );
      setQueue(appts);
      setAllToday(j.appointments ?? []);
    } finally { setLoading(false); }
  }, [todayStr]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const patch = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    load();
  };

  const waiting   = queue.length;
  const completed = allToday.filter(a => a.status === 'completed').length;
  const noShow    = allToday.filter(a => a.status === 'no-show').length;

  const STATUS_DOT: Record<string, string> = {
    pending: 'bg-amber-400', confirmed: 'bg-teal-500',
    completed: 'bg-emerald-500', cancelled: 'bg-red-400', 'no-show': 'bg-slate-400',
  };

  return (
    <DashboardShell
      title={isAr ? 'قائمة الانتظار' : 'Queue / Waiting List'}
      subtitle={isAr ? 'المرضى الحاليون في العيادة' : 'Live patient queue management'}
      actions={
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-bold hover:bg-white/25 backdrop-blur-sm transition-all">
          <span className="material-symbols-outlined text-sm">refresh</span>
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      }
    >
      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: 'pending',    label: isAr ? 'ينتظر' : 'Waiting',   value: waiting,   gradient: 'from-amber-400 to-orange-500',  glow: 'shadow-amber-500/20' },
          { icon: 'task_alt',   label: isAr ? 'مكتمل' : 'Completed', value: completed, gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/20' },
          { icon: 'person_off', label: isAr ? 'غائب'  : 'No-show',   value: noShow,    gradient: 'from-slate-400 to-slate-500',   glow: 'shadow-slate-400/20' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i)}>
            {loading ? <Skeleton className="h-28 rounded-3xl" /> : (
              <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${s.glow} overflow-hidden group`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full blur-xl`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md mb-4`}>
                  <span className="material-symbols-outlined text-white text-xl">{s.icon}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 tabular-nums leading-none">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1.5">{s.label}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* ── Live Queue ── */}
        <motion.div {...fadeUp(3)} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div>
              <h3 className="font-black text-slate-900">{isAr ? 'قائمة الانتظار الحالية' : 'Current Queue'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {now.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-black border ${waiting > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              {waiting}
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
              </div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl text-slate-300">how_to_reg</span>
                </div>
                <p className="font-bold text-slate-600">{isAr ? 'قائمة الانتظار فارغة' : 'Queue is empty'}</p>
                <p className="text-xs text-slate-400 mt-1">{isAr ? 'لا يوجد مرضى ينتظرون حالياً' : 'No patients currently waiting'}</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={queue} onReorder={setQueue}>
                <AnimatePresence>
                  {queue.map((p, i) => (
                    <Reorder.Item key={p._id} value={p}>
                      <motion.div
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 px-6 py-4 border-b border-slate-50 transition-colors ${i === 0 ? 'bg-teal-50/50' : 'hover:bg-slate-50/60'}`}
                      >
                        {/* Position badge */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                          i === 0 ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200' : 'bg-slate-100 text-slate-600'
                        }`}>{i + 1}</div>

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-transform group-hover:scale-105 ${
                          i === 0 ? 'bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-200 text-teal-700' : 'bg-slate-100 text-slate-600'
                        }`}>{p.name[0].toUpperCase()}</div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                            {i === 0 && (
                              <span className="text-[10px] font-black text-teal-700 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                                {isAr ? 'التالي' : 'NEXT'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p.service}{p.time ? ` · ${p.time}` : ''}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a href={`tel:${p.phone}`}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">call</span>
                          </a>
                          <button onClick={() => patch(p._id, 'completed')}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button onClick={() => patch(p._id, 'no-show')}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">person_off</span>
                          </button>
                        </div>

                        {/* Drag handle */}
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing">
                          <span className="material-symbols-outlined text-base">drag_indicator</span>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </motion.div>

        {/* ── Today Summary ── */}
        <motion.div {...fadeUp(4)} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-black text-slate-900">{isAr ? 'ملخص اليوم' : "Today's Summary"}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {allToday.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-3xl text-slate-300">event_available</span>
                </div>
                <p className="text-sm font-bold text-slate-500">{isAr ? 'لا توجد مواعيد اليوم' : 'No appointments today'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {allToday.map((a, i) => (
                  <div key={a._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-black flex items-center justify-center text-xs shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{a.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{a.service}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${STATUS_DOT[a.status] ?? 'bg-slate-300'}`} />
                      <span className="text-[11px] font-bold text-slate-600">{a.time || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}

"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface QueuePatient {
  _id: string; name: string; service: string; phone: string;
  time?: string; status: string; waitingSince?: Date; arrivalOrder?: number;
}

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
      const appts: QueuePatient[] = (j.appointments ?? [])
        .filter((a: QueuePatient) => a.status === 'confirmed' || a.status === 'pending');
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

  const waiting = queue.length;
  const completed = allToday.filter(a => a.status === 'completed').length;
  const noShow = allToday.filter(a => a.status === 'no-show').length;

  const T = {
    title:       isAr ? 'قائمة الانتظار' : 'Queue / Waiting List',
    subtitle:    isAr ? 'المرضى الحاليون في العيادة' : 'Current patients in the clinic',
    waiting:     isAr ? 'ينتظر' : 'Waiting',
    completed:   isAr ? 'مكتمل' : 'Completed',
    noShow:      isAr ? 'غائب' : 'No-show',
    emptyQueue:  isAr ? 'قائمة الانتظار فارغة' : 'Queue is empty',
    noAppts:     isAr ? 'لا توجد مواعيد اليوم' : 'No appointments today',
    next:        isAr ? 'التالي' : 'NEXT',
    arrive:      isAr ? 'حضر' : 'Mark Arrived',
    complete:    isAr ? 'مكتمل' : 'Complete',
    noShowBtn:   isAr ? 'غياب' : 'No-show',
    call:        isAr ? 'اتصال' : 'Call',
    refresh:     isAr ? 'تحديث' : 'Refresh',
    todaySummary:isAr ? 'ملخص اليوم' : "Today's Summary",
    time:        isAr ? 'الوقت' : 'Time',
    patient:     isAr ? 'المريض' : 'Patient',
    service:     isAr ? 'الخدمة' : 'Service',
    status:      isAr ? 'الحالة' : 'Status',
    actions:     isAr ? 'إجراءات' : 'Actions',
  };

  return (
    <DashboardShell
      title={T.title}
      subtitle={T.subtitle}
      actions={
        <Button variant="outline" onClick={load} className="gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span>{T.refresh}
        </Button>
      }
    >
      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: 'pending', label: T.waiting,   value: waiting,   color: 'from-amber-400 to-amber-500' },
            { icon: 'task_alt', label: T.completed, value: completed, color: 'from-emerald-500 to-emerald-600' },
            { icon: 'person_off', label: T.noShow, value: noShow,    color: 'from-slate-400 to-slate-500' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0 shadow-md`}>
                    <span className="material-symbols-outlined text-white text-2xl">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-black/5">
            <div>
              <CardTitle className="font-black text-lg">{isAr ? 'قائمة الانتظار الحالية' : 'Current Queue'}</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{now.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-lg py-1 px-3">
              {waiting}
            </Badge>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-3xl text-slate-300">how_to_reg</span>
                </div>
                <p className="font-bold text-slate-600">{T.emptyQueue}</p>
                <p className="text-slate-400 text-sm mt-1">{isAr ? 'لا يوجد مرضى ينتظرون حالياً' : 'No patients currently waiting'}</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={queue} onReorder={setQueue} className="divide-y divide-black/5">
                <AnimatePresence>
                  {queue.map((p, i) => (
                    <Reorder.Item key={p._id} value={p}>
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 px-6 py-4 ${i === 0 ? 'bg-primary/5' : 'hover:bg-slate-50'} transition-colors`}>
                        {/* Position */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {i + 1}
                        </div>
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary-dark font-black flex items-center justify-center text-sm shrink-0">
                          {p.name[0].toUpperCase()}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                            {i === 0 && <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">{T.next}</Badge>}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{p.service} {p.time ? `· ${p.time}` : ''}</p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a href={`tel:${p.phone}`} title={T.call}
                            className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <span className="material-symbols-outlined text-sm">call</span>
                          </a>
                          <Button variant="ghost" size="icon" onClick={() => patch(p._id, 'completed')} className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title={T.complete}>
                            <span className="material-symbols-outlined text-sm">check</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => patch(p._id, 'no-show')} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" title={T.noShowBtn}>
                            <span className="material-symbols-outlined text-sm">person_off</span>
                          </Button>
                        </div>
                        {/* Drag handle */}
                        <div className="text-slate-300 cursor-grab active:cursor-grabbing px-2 flex items-center justify-center">
                          <span className="material-symbols-outlined text-base">drag_indicator</span>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </CardContent>
        </Card>

        {/* Today summary */}
        <Card>
          <CardHeader className="pb-2 border-b border-black/5 flex flex-col justify-center">
            <CardTitle className="font-black text-lg">{T.todaySummary}</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/5">
              {allToday.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center px-4">
                  <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">event_available</span>
                  <p className="text-sm text-slate-500">{T.noAppts}</p>
                </div>
              ) : allToday.map((a, i) => {
                const statusColors: Record<string, string> = {
                  pending:'text-amber-600', confirmed:'text-teal-600',
                  completed:'text-emerald-600', cancelled:'text-red-500', 'no-show':'text-slate-400',
                };
                return (
                  <div key={a._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{a.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{a.service}</p>
                    </div>
                    <span className={`text-[11px] font-bold shrink-0 ${statusColors[a.status] ?? 'text-slate-400'}`}>
                      {a.time || '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

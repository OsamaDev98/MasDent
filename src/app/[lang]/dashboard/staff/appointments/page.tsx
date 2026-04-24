"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
interface Appointment {
  _id: string; name: string; email: string; phone: string; service: string;
  date: string; time?: string; notes?: string; status: Status;
  paymentStatus?: 'paid' | 'unpaid'; createdAt: string;
}

const STATUS_CFG = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: 'schedule', label: 'Pending', labelAr: 'انتظار' },
  confirmed: { color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', icon: 'check_circle', label: 'Confirmed', labelAr: 'مؤكد' },
  completed: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'task_alt', label: 'Completed', labelAr: 'مكتمل' },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: 'cancel', label: 'Cancelled', labelAr: 'ملغى' },
  'no-show': { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', icon: 'person_off', label: 'No-show', labelAr: 'غائب' },
} as const;

const STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

const apptSchema = z.object({
  name: z.string().min(2), email: z.string().email(), phone: z.string().min(7),
  date: z.string().min(1), time: z.string().optional(),
  service: z.string().min(1), notes: z.string().optional(),
});
type ApptForm = z.infer<typeof apptSchema>;

export default function StaffAppointmentsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState<Appointment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApptForm>({ resolver: zodResolver(apptSchema) });

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams();
      if (filter !== 'all') p.set('status', filter);
      if (dateFilter) p.set('date', dateFilter);
      if (search) p.set('q', search);
      const r = await fetch(`/api/appointments?${p}`);
      const j = await r.json();
      setAppts(j.appointments ?? []);
    } finally { setLoading(false); }
  }, [filter, dateFilter, search]);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, updates: Partial<Appointment>) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      toast.success(isAr ? 'تم الحفظ' : 'Saved');
      load();
      if (sel?._id === id) setSel(prev => prev ? { ...prev, ...updates } : null);
    } catch { toast.error(isAr ? 'حدث خطأ' : 'Error'); }
  };

  const onAdd = async (data: ApptForm) => {
    setSaving(true);
    try {
      await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      reset(); setShowAdd(false); load();
      toast.success(isAr ? 'تمت الإضافة' : 'Appointment added');
    } finally { setSaving(false); }
  };

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s; } };
  const statusLabel = (s: string) => isAr ? (STATUS_CFG[s as Status]?.labelAr ?? s) : (STATUS_CFG[s as Status]?.label ?? s);
  const counts: Record<string, number> = { all: appts.length };
  appts.forEach(a => { counts[a.status] = (counts[a.status] ?? 0) + 1; });

  return (
    <DashboardShell
      title={isAr ? 'المواعيد' : 'Appointments'}
      subtitle={isAr ? 'إدارة جميع المواعيد ومتابعتها' : 'Manage and track all patient appointments'}
      actions={
        <Button
          onClick={() => setShowAdd(true)}
          className="gap-2 bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {isAr ? 'موعد جديد' : 'New Appointment'}
        </Button>
      }
    >
      {/* ── Premium Filter Bar ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <span className={`material-symbols-outlined absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 text-lg`}>search</span>
            <Input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
              className={`h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-teal-500/20 ${isAr ? 'pr-11' : 'pl-11'}`}
            />
          </div>

          {/* Date + Status pills */}
          <div className="flex flex-col sm:flex-row gap-3 xl:items-center">
            <div className="flex items-center gap-2 h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="material-symbols-outlined text-slate-400 text-sm">calendar_month</span>
              <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-auto p-0 text-sm font-medium w-36" />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} className="text-slate-400 hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-0.5 overflow-x-auto">
              {(['all', ...STATUSES] as const).map(f => {
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`relative px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${active ? 'text-teal-700 bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {f === 'all' ? (isAr ? 'الكل' : 'All') : statusLabel(f)}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                      {f === 'all' ? counts.all ?? 0 : counts[f] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
          </div>
        ) : appts.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
            </div>
            <p className="font-bold text-slate-700 text-base mb-1">{isAr ? 'لا توجد مواعيد' : 'No appointments found'}</p>
            <p className="text-slate-400 text-sm">{isAr ? 'جرب تغيير الفلاتر' : 'Try changing your filters'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 border-b border-slate-100 hover:bg-slate-50/80">
                  {[isAr ? 'المريض' : 'Patient', isAr ? 'الخدمة' : 'Service', isAr ? 'التاريخ والوقت' : 'Date & Time', isAr ? 'الحالة' : 'Status', isAr ? 'الدفع' : 'Payment', isAr ? 'تفاصيل' : 'Details'].map(h => (
                    <TableHead key={h} className={`h-12 font-black text-slate-500 text-xs uppercase tracking-wide ${isAr ? 'text-right' : 'text-left'}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {appts.map((a, i) => {
                    const cfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending;
                    return (
                      <motion.tr key={a._id}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                      >
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-100 text-teal-700 font-black flex items-center justify-center text-sm shrink-0 group-hover:scale-105 transition-transform">
                              {a.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{a.name}</p>
                              <p className="text-[11px] text-slate-400">{a.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 w-fit">
                            <span className="material-symbols-outlined text-slate-400 text-sm">medical_services</span>
                            <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">{a.service}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-bold text-slate-900">{fd(a.date)}</p>
                          {a.time && <p className="text-[11px] text-teal-600 font-semibold mt-0.5">{a.time}</p>}
                        </TableCell>
                        <TableCell>
                          <div className="relative inline-flex items-center">
                            <span className={`material-symbols-outlined absolute ${isAr ? 'right-2' : 'left-2'} text-[13px] pointer-events-none ${cfg.color}`}>{cfg.icon}</span>
                            <select value={a.status}
                              onChange={e => patch(a._id, { status: e.target.value as Status })}
                              className={`appearance-none text-xs font-bold border rounded-xl outline-none cursor-pointer transition-all hover:shadow-sm ${cfg.bg} ${cfg.color} ${isAr ? 'pr-9 pl-5' : 'pl-9 pr-5'} py-1.5`}
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                            </select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => patch(a._id, { paymentStatus: a.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 ${a.paymentStatus === 'paid'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                              }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {a.paymentStatus === 'paid' ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            {a.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                          </button>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => setSel(a)}
                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-teal-100 hover:text-teal-700 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => setSel(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden">

              {/* Modal header with gradient */}
              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 pt-6 pb-8 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl" />
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-black text-2xl">
                      {sel.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{sel.name}</h3>
                      <p className="text-teal-200/70 text-sm mt-0.5">{sel.email} · {sel.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => setSel(null)} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7 -mt-4">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: isAr ? 'الخدمة' : 'Service', value: sel.service, icon: 'medical_services' },
                    { label: isAr ? 'التاريخ' : 'Date', value: fd(sel.date), icon: 'event' },
                    { label: isAr ? 'الوقت' : 'Time', value: sel.time || '—', icon: 'schedule' },
                    { label: isAr ? 'الدفع' : 'Payment', value: sel.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid'), icon: 'payments' },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-start gap-3">
                      <span className="material-symbols-outlined text-teal-500/70 text-lg">{r.icon}</span>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{r.label}</p>
                        <p className="text-slate-800 font-bold text-sm mt-0.5">{r.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {sel.notes && (
                  <div className="bg-amber-50 rounded-2xl p-4 mb-5 border border-amber-100">
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                      {isAr ? 'ملاحظات' : 'Notes'}
                    </p>
                    <p className="text-sm text-amber-900 font-medium leading-relaxed">{sel.notes}</p>
                  </div>
                )}

                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{isAr ? 'تحديث الحالة' : 'Update Status'}</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => {
                    const cfg = STATUS_CFG[s];
                    const active = sel.status === s;
                    return (
                      <button key={s} onClick={() => patch(sel._id, { status: s })}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${active ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 scale-105` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}>
                        <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
                        {statusLabel(s)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Appointment Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh]">

              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">event_available</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{isAr ? 'إضافة موعد جديد' : 'New Appointment'}</h3>
                  </div>
                  <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7 overflow-y-auto">
                <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                  {[
                    { name: 'name' as const, label: isAr ? 'الاسم الكامل' : 'Full Name', type: 'text', ph: isAr ? 'اسم المريض' : 'Patient name', icon: 'person' },
                    { name: 'email' as const, label: isAr ? 'البريد الإلكتروني' : 'Email', type: 'email', ph: 'email@example.com', icon: 'mail' },
                    { name: 'phone' as const, label: isAr ? 'رقم الهاتف' : 'Phone', type: 'tel', ph: isAr ? '05x xxx xxxx' : '(555) 123-4567', icon: 'call' },
                    { name: 'date' as const, label: isAr ? 'التاريخ' : 'Date', type: 'date', ph: '', icon: 'calendar_month' },
                    { name: 'time' as const, label: isAr ? 'الوقت (اختياري)' : 'Time (Optional)', type: 'time', ph: '', icon: 'schedule' },
                    { name: 'service' as const, label: isAr ? 'الخدمة' : 'Service', type: 'text', ph: isAr ? 'نوع الخدمة' : 'e.g. Cleaning', icon: 'medical_services' },
                  ].map(f => (
                    <div key={f.name}>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{f.label}</Label>
                      <div className="relative">
                        <span className={`material-symbols-outlined absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-[18px]`}>{f.icon}</span>
                        <Input type={f.type} {...register(f.name)} placeholder={f.ph}
                          className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${isAr ? 'pr-10' : 'pl-10'} ${errors[f.name] ? 'border-red-400 bg-red-50' : 'focus-visible:ring-teal-500/20'}`} />
                      </div>
                      {errors[f.name] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[f.name]?.message}</p>}
                    </div>
                  ))}
                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr ? 'ملاحظات' : 'Notes (optional)'}</Label>
                    <textarea {...register('notes')} rows={3} placeholder={isAr ? 'أضف ملاحظات اختيارية...' : 'Any notes...'}
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none transition-all" />
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                    {saving
                      ? <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      : <><span className="material-symbols-outlined text-sm">event_available</span>{isAr ? 'إضافة الموعد' : 'Add Appointment'}</>
                    }
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

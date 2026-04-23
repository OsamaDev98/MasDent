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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
interface Appointment {
  _id: string; name: string; email: string; phone: string; service: string;
  date: string; time?: string; notes?: string; status: Status;
  paymentStatus?: 'paid' | 'unpaid'; paymentNotes?: string; createdAt: string;
}

const STATUS_CFG = {
  pending:   { color:'text-amber-600',   bg:'bg-amber-100 border-amber-200',   icon:'schedule',    label:'Pending',   labelAr:'انتظار' },
  confirmed: { color:'text-teal-600',    bg:'bg-teal-100 border-teal-200',     icon:'check_circle',label:'Confirmed', labelAr:'مؤكد' },
  completed: { color:'text-emerald-600', bg:'bg-emerald-100 border-emerald-200',icon:'task_alt',   label:'Completed', labelAr:'مكتمل' },
  cancelled: { color:'text-red-600',     bg:'bg-red-100 border-red-200',       icon:'cancel',      label:'Cancelled', labelAr:'ملغى' },
  'no-show': { color:'text-slate-500',   bg:'bg-slate-100 border-slate-200',   icon:'person_off',  label:'No-show',   labelAr:'غائب' },
} as const;

const STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

const apptSchema = z.object({
  name:    z.string().min(2, 'Name required'),
  email:   z.string().email('Valid email required'),
  phone:   z.string().min(7, 'Phone required'),
  date:    z.string().min(1, 'Date required'),
  time:    z.string().optional(),
  service: z.string().min(1, 'Service required'),
  notes:   z.string().optional(),
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
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (dateFilter) params.set('date', dateFilter);
      if (search) params.set('q', search);
      const r = await fetch(`/api/appointments?${params}`);
      const j = await r.json();
      setAppts(j.appointments ?? []);
    } finally { setLoading(false); }
  }, [filter, dateFilter, search]);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, updates: Partial<Appointment>) => {
    try {
      await fetch(`/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      if (updates.status) toast.success(isAr ? 'تم تحديث حالة الموعد' : 'Appointment status updated');
      else toast.success(isAr ? 'تم حفظ التغييرات' : 'Changes saved');
      load();
      if (sel?._id === id) setSel(prev => prev ? { ...prev, ...updates } : null);
    } catch { toast.error(isAr ? 'حدث خطأ' : 'Something went wrong'); }
  };

  const onAdd = async (data: ApptForm) => {
    setSaving(true);
    try {
      await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      reset(); setShowAdd(false); load();
    } finally { setSaving(false); }
  };

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s; } };

  const statusLabel = (s: string) => isAr ? (STATUS_CFG[s as Status]?.labelAr ?? s) : (STATUS_CFG[s as Status]?.label ?? s);

  const filterCounts: Record<string, number> = { all: appts.length };
  appts.forEach(a => { filterCounts[a.status] = (filterCounts[a.status] ?? 0) + 1; });

  return (
    <DashboardShell
      title={t('appointments') || (isAr ? 'المواعيد' : 'Appointments')}
      subtitle={t('appointments_subtitle') || (isAr ? 'إدارة جميع المواعيد ومتابعتها' : 'Manage and track all patient appointments')}
      actions={
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          {t('new_appointment') || (isAr ? 'موعد جديد' : 'New Appointment')}
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className={`material-symbols-outlined absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-lg`}>search</span>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            className={isAr ? 'pr-10' : 'pl-10'}
          />
        </div>
        <div className="flex gap-2">
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-auto" />
          {dateFilter && <Button variant="ghost" onClick={() => setDateFilter('')} size="icon">✕</Button>}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(['all', ...STATUSES] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="rounded-full text-xs"
          >
            {f === 'all' ? (isAr ? `الكل (${filterCounts.all ?? 0})` : `All (${filterCounts.all ?? 0})`) : `${statusLabel(f)} (${filterCounts[f] ?? 0})`}
          </Button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : appts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">event_busy</span>
            <p className="font-bold text-slate-600">{isAr ? 'لا توجد مواعيد' : 'No appointments found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[isAr?'المريض':'Patient', isAr?'الخدمة':'Service', isAr?'التاريخ':'Date', isAr?'الحالة':'Status', isAr?'الدفع':'Payment', isAr?'إجراءات':'Actions'].map(h => (
                    <TableHead key={h} className={isAr ? 'text-right' : 'text-left'}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {appts.map((a, i) => {
                    const cfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending;
                    return (
                      <TableRow key={a._id} className="border-b transition-colors hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary-dark font-black flex items-center justify-center text-sm shrink-0">{a.name[0].toUpperCase()}</div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                              <p className="text-[11px] text-slate-500">{a.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><p className="text-sm text-slate-700 max-w-[140px] truncate">{a.service}</p></TableCell>
                        <TableCell><p className="text-sm font-semibold text-slate-900">{fd(a.date)}</p>{a.time && <p className="text-[11px] text-slate-500">{a.time}</p>}</TableCell>
                        <TableCell>
                          <select
                            value={a.status}
                            onChange={e => patch(a._id, { status: e.target.value as Status })}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${cfg.bg} ${cfg.color}`}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline"
                            onClick={() => patch(a._id, { paymentStatus: a.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
                            className={`cursor-pointer transition-all ${a.paymentStatus === 'paid' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-emerald-50'}`}
                          >
                            {a.paymentStatus === 'paid' ? (isAr ? '✓ مدفوع' : '✓ Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSel(a)}>
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Detail modal */}
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSel(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{sel.name}</h3>
                  <p className="text-slate-500 text-sm">{sel.email} · {sel.phone}</p>
                </div>
                <button onClick={() => setSel(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: isAr ? 'الخدمة' : 'Service',  value: sel.service },
                  { label: isAr ? 'التاريخ' : 'Date',    value: fd(sel.date) },
                  { label: isAr ? 'الوقت' : 'Time',      value: sel.time || '—' },
                  { label: isAr ? 'الحالة' : 'Status',   value: statusLabel(sel.status) },
                  { label: isAr ? 'الدفع' : 'Payment',   value: sel.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid') },
                ].map(r => (
                  <div key={r.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{r.label}</p>
                    <p className="text-slate-800 font-semibold text-sm mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
              {sel.notes && <div className="bg-slate-50 rounded-xl p-3 mb-5"><p className="text-[10px] text-slate-500 font-bold uppercase">{isAr ? 'ملاحظات' : 'Notes'}</p><p className="text-sm text-slate-700 mt-1">{sel.notes}</p></div>}
              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== sel.status).map(s => {
                  const cfg = STATUS_CFG[s];
                  return (
                    <Button key={s} variant="outline" onClick={() => patch(sel._id, { status: s })} className={`flex-1 ${cfg.color} border-${cfg.color.split('-')[1]}-200 hover:bg-${cfg.color.split('-')[1]}-50`}>
                      {statusLabel(s)}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add appointment modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">{isAr ? 'إضافة موعد جديد' : 'New Appointment'}</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                {[
                  { name: 'name' as const,    label: isAr ? 'الاسم الكامل' : 'Full Name',    type: 'text',  ph: isAr ? 'اسم المريض' : 'Patient name' },
                  { name: 'email' as const,   label: isAr ? 'البريد الإلكتروني' : 'Email',   type: 'email', ph: 'email@example.com' },
                  { name: 'phone' as const,   label: isAr ? 'رقم الهاتف' : 'Phone',          type: 'tel',   ph: isAr ? '05x xxx xxxx' : '(555) 123-4567' },
                  { name: 'date' as const,    label: isAr ? 'التاريخ' : 'Date',               type: 'date',  ph: '' },
                  { name: 'time' as const,    label: isAr ? 'الوقت' : 'Time (Optional)',       type: 'time',  ph: '' },
                  { name: 'service' as const, label: isAr ? 'الخدمة' : 'Service',             type: 'text',  ph: isAr ? 'نوع الخدمة' : 'e.g. Cleaning' },
                ].map(f => (
                  <div key={f.name}>
                    <Label className="block mb-2">{f.label}</Label>
                    <Input type={f.type} {...register(f.name)} placeholder={f.ph} className={errors[f.name] ? 'border-red-500' : ''} />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]?.message}</p>}
                  </div>
                ))}
                <div>
                  <Label className="block mb-2">{isAr ? 'ملاحظات' : 'Notes'}</Label>
                  <textarea {...register('notes')} rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                </div>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : isAr ? 'إضافة الموعد' : 'Add Appointment'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

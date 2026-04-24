"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Appointment {
  _id: string; name: string; phone: string; service: string;
  date: string; status: string; paymentStatus?: 'paid' | 'unpaid'; paymentNotes?: string;
}

const STATUS_CFG: Record<string, { bg: string; color: string; icon: string }> = {
  completed: { bg: 'bg-emerald-50 border-emerald-200', color: 'text-emerald-700', icon: 'task_alt' },
  confirmed: { bg: 'bg-teal-50 border-teal-200',       color: 'text-teal-700',    icon: 'check_circle' },
  cancelled: { bg: 'bg-red-50 border-red-200',         color: 'text-red-700',     icon: 'cancel' },
  pending:   { bg: 'bg-amber-50 border-amber-200',     color: 'text-amber-700',   icon: 'schedule' },
  'no-show': { bg: 'bg-slate-50 border-slate-200',     color: 'text-slate-600',   icon: 'person_off' },
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

export default function StaffPaymentsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [noteModal, setNoteModal] = useState<Appointment | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/appointments');
      const j = await r.json();
      setAppts(j.appointments ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePayment = async (a: Appointment) => {
    const newStatus = a.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    await fetch(`/api/appointments/${a._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: newStatus }),
    });
    toast.success(newStatus === 'paid' ? (isAr ? 'تم تسجيل الدفعة ✔' : 'Marked as paid ✔') : (isAr ? 'تم إلغاء الدفعة' : 'Marked as unpaid'));
    load();
  };

  const saveNote = async () => {
    if (!noteModal) return;
    setSaving(true);
    try {
      await fetch(`/api/appointments/${noteModal._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentNotes: noteText }),
      });
      toast.success(isAr ? 'تم حفظ الملاحظة' : 'Note saved!');
      setNoteModal(null); load();
    } finally { setSaving(false); }
  };

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }); } catch { return s; } };

  const filtered  = appts.filter(a => filter === 'all' ? true : a.paymentStatus === filter);
  const totalPaid = appts.filter(a => a.paymentStatus === 'paid').length;
  const totalUnpaid = appts.filter(a => a.paymentStatus !== 'paid').length;
  const paidRate = appts.length > 0 ? Math.round((totalPaid / appts.length) * 100) : 0;

  return (
    <DashboardShell
      title={isAr ? 'المدفوعات' : 'Payments'}
      subtitle={isAr ? 'متابعة وتسجيل المدفوعات' : 'Track and record appointment payments'}
    >
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: 'receipt_long', label: isAr ? 'إجمالي المواعيد' : 'Total Appts', value: appts.length,  gradient: 'from-slate-500 to-slate-600',   glow: 'shadow-slate-400/20' },
          { icon: 'check_circle', label: isAr ? 'مدفوع'           : 'Paid',         value: totalPaid,     gradient: 'from-emerald-500 to-green-500', glow: 'shadow-emerald-500/20' },
          { icon: 'pending',      label: isAr ? 'غير مدفوع'       : 'Unpaid',       value: totalUnpaid,   gradient: 'from-amber-400 to-orange-500',  glow: 'shadow-amber-500/20' },
          { icon: 'percent',      label: isAr ? 'نسبة الدفع'      : 'Payment Rate', value: `${paidRate}%`, gradient: 'from-teal-500 to-teal-600',    glow: 'shadow-teal-500/20' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i)}>
            {loading ? <Skeleton className="h-28 rounded-3xl" /> : (
              <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${s.glow} overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
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

      {/* ── Payment Rate Bar ── */}
      <motion.div {...fadeUp(4)} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-black text-slate-900">{isAr ? 'نسبة الدفع الإجمالية' : 'Overall Payment Rate'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{isAr ? `${totalPaid} مدفوع · ${totalUnpaid} غير مدفوع` : `${totalPaid} paid · ${totalUnpaid} unpaid`}</p>
          </div>
          <span className="text-3xl font-black text-emerald-600 tabular-nums">{paidRate}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${paidRate}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </motion.div>

      {/* ── Filter Tabs + Table ── */}
      <motion.div {...fadeUp(5)} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-0.5">
            {(['all', 'paid', 'unpaid'] as const).map(f => {
              const active = filter === f;
              const count = f === 'all' ? appts.length : f === 'paid' ? totalPaid : totalUnpaid;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${active ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {f === 'all' ? (isAr ? 'الكل' : 'All') : f === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400 font-medium">{filtered.length} {isAr ? 'سجل' : 'records'}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">payments</span>
            </div>
            <p className="font-bold text-slate-600">{isAr ? 'لا توجد سجلات' : 'No records found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  {[isAr ? 'المريض' : 'Patient', isAr ? 'الخدمة' : 'Service', isAr ? 'التاريخ' : 'Date', isAr ? 'الحالة' : 'Status', isAr ? 'الدفع' : 'Payment', isAr ? 'ملاحظات' : 'Notes'].map(h => (
                    <TableHead key={h} className={`h-12 font-black text-slate-500 text-xs uppercase tracking-wide ${isAr ? 'text-right' : 'text-left'}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((a, i) => {
                    const scfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending;
                    return (
                      <motion.tr key={a._id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-100 text-teal-700 font-black flex items-center justify-center text-sm shrink-0">
                              {a.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{a.name}</p>
                              <p className="text-[11px] text-slate-400">{a.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-700 max-w-[140px] truncate block">{a.service}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-slate-900">{fd(a.date)}</span>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${scfg.bg} ${scfg.color}`}>
                            <span className="material-symbols-outlined text-[13px]">{scfg.icon}</span>
                            {a.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => togglePayment(a)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 ${
                              a.paymentStatus === 'paid'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700'
                            }`}>
                            <span className="material-symbols-outlined text-[13px]">{a.paymentStatus === 'paid' ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {a.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                          </button>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => { setNoteModal(a); setNoteText(a.paymentNotes ?? ''); }}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors group">
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            <span className="max-w-[100px] truncate group-hover:text-teal-600">
                              {a.paymentNotes || (isAr ? 'إضافة ملاحظة' : 'Add note')}
                            </span>
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
      </motion.div>

      {/* ── Note Modal ── */}
      <AnimatePresence>
        {noteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => setNoteModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden">

              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">sticky_note_2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{isAr ? 'ملاحظة الدفع' : 'Payment Note'}</h3>
                      <p className="text-teal-200/70 text-xs mt-0.5">{noteModal.name} · {noteModal.service}</p>
                    </div>
                  </div>
                  <button onClick={() => setNoteModal(null)} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7">
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                  placeholder={isAr ? 'مثال: دفع نقداً، أو قسط أول...' : 'e.g. Cash payment, first installment...'}
                  className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none mb-4 transition-all" />
                <button onClick={saveNote} disabled={saving}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <><span className="material-symbols-outlined text-sm">save</span>{isAr ? 'حفظ الملاحظة' : 'Save Note'}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

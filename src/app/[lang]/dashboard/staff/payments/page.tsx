"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Appointment {
  _id: string; name: string; phone: string; service: string;
  date: string; status: string; paymentStatus?: 'paid' | 'unpaid'; paymentNotes?: string;
}

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
    toast.success(
      newStatus === 'paid'
        ? (isAr ? 'تم تسجيل الدفعة بنجاح ✔' : 'Marked as paid ✔')
        : (isAr ? 'تم إلغاء تسجيل الدفعة' : 'Marked as unpaid')
    );
    load();
  };

  const saveNote = async () => {
    if (!noteModal) return;
    setSaving(true);
    const tid = toast.loading(isAr ? 'جارٍ الحفظ...' : 'Saving note...');
    try {
      await fetch(`/api/appointments/${noteModal._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentNotes: noteText }),
      });
      toast.success(isAr ? 'تم حفظ الملاحظة' : 'Note saved!', { id: tid });
      setNoteModal(null); load();
    } finally { setSaving(false); }
  };

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }); } catch { return s; } };

  const filtered = appts.filter(a => filter === 'all' ? true : a.paymentStatus === filter);
  const totalPaid = appts.filter(a => a.paymentStatus === 'paid').length;
  const totalUnpaid = appts.filter(a => a.paymentStatus !== 'paid').length;

  return (
    <DashboardShell
      title={t('payments') || (isAr ? 'المدفوعات' : 'Payments')}
      subtitle={t('payments_subtitle') || (isAr ? 'متابعة وتسجيل المدفوعات' : 'Track and record appointment payments')}
    >
      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: 'receipt_long', label: isAr ? 'إجمالي المواعيد' : 'Total Appts', value: appts.length, color: 'from-slate-500 to-slate-600' },
            { icon: 'check_circle', label: isAr ? 'مدفوع' : 'Paid',   value: totalPaid,   color: 'from-emerald-500 to-emerald-600' },
            { icon: 'pending',      label: isAr ? 'غير مدفوع' : 'Unpaid', value: totalUnpaid, color: 'from-amber-400 to-amber-500' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0 shadow-md`}>
                    <span className="material-symbols-outlined text-white text-2xl">{s.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['all', 'paid', 'unpaid'] as const).map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="rounded-full text-xs gap-1">
            {f === 'all' ? (isAr ? 'الكل' : 'All') : f === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
            <span>({f === 'all' ? appts.length : f === 'paid' ? totalPaid : totalUnpaid})</span>
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">payments</span>
              <p className="font-bold text-slate-600">{isAr ? 'لا توجد سجلات' : 'No records found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[isAr?'المريض':'Patient', isAr?'الخدمة':'Service', isAr?'التاريخ':'Date', isAr?'الحالة':'Status', isAr?'الدفع':'Payment', isAr?'ملاحظات':'Notes'].map(h => (
                      <TableHead key={h} className={isAr?'text-right':'text-left'}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((a, i) => (
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
                        <TableCell className="text-sm text-slate-700 max-w-[140px] truncate">{a.service}</TableCell>
                        <TableCell className="text-sm font-semibold text-slate-900">{fd(a.date)}</TableCell>
                        <TableCell>
                          <Badge variant={a.status === 'completed' ? 'default' : a.status === 'confirmed' ? 'secondary' : a.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant={a.paymentStatus === 'paid' ? 'default' : 'outline'} size="sm" onClick={() => togglePayment(a)}
                            className={`h-7 px-3 text-[11px] gap-1.5 rounded-full ${a.paymentStatus === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : 'text-amber-600 border-amber-200 hover:bg-amber-50'}`}>
                            <span className="material-symbols-outlined text-[12px]">{a.paymentStatus === 'paid' ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {a.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => { setNoteModal(a); setNoteText(a.paymentNotes ?? ''); }} className="h-8 gap-1 text-slate-500 hover:text-primary-dark">
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            {a.paymentNotes ? <span className="max-w-[100px] truncate">{a.paymentNotes}</span> : (isAr ? 'إضافة ملاحظة' : 'Add note')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note modal */}
      <AnimatePresence>
        {noteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setNoteModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900">{isAr ? 'ملاحظة الدفع' : 'Payment Note'}</h3>
                <button onClick={() => setNoteModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <p className="text-sm text-slate-500 mb-3">{noteModal.name} · {noteModal.service}</p>
              <Textarea
                value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                placeholder={isAr ? 'مثال: دفع نقداً، أو قسط أول...' : 'e.g. Cash payment, first installment...'}
                className="mb-4 resize-none"
              />
              <Button onClick={saveNote} disabled={saving} className="w-full gap-2 py-6 text-base">
                {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : isAr ? 'حفظ الملاحظة' : 'Save Note'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

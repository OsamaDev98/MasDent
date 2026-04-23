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
import { Progress } from '@/components/ui/progress';

interface Appointment {
  _id: string; name: string; phone: string; service: string;
  date: string; status: string; paymentStatus?: string; paymentNotes?: string; createdAt: string;
}

export default function AdminFinancePage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | '7d' | '30d' | '90d'>('30d');

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/appointments');
      const j = await r.json();
      setAppts(j.appointments ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  const periodMs: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

  const filtered = appts.filter(a => {
    if (period === 'all') return true;
    const days = periodMs[period] ?? 30;
    return (now - new Date(a.createdAt).getTime()) < days * 24 * 60 * 60 * 1000;
  });

  const paid   = filtered.filter(a => a.paymentStatus === 'paid');
  const unpaid = filtered.filter(a => a.paymentStatus !== 'paid');
  const paidRate = filtered.length > 0 ? Math.round((paid.length / filtered.length) * 100) : 0;

  // Revenue by month (last 6)
  const monthlyData: Record<string, { paid: number; unpaid: number }> = {};
  filtered.forEach(a => {
    const key = new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[key]) monthlyData[key] = { paid: 0, unpaid: 0 };
    if (a.paymentStatus === 'paid') monthlyData[key].paid++;
    else monthlyData[key].unpaid++;
  });
  const monthlyArr = Object.entries(monthlyData).slice(-6).map(([m, v]) => ({ month: m, ...v }));
  const maxMonthly = Math.max(...monthlyArr.map(m => m.paid + m.unpaid), 1);

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s; } };

  const exportCSV = () => {
    const rows = [
      ['Name', 'Phone', 'Service', 'Date', 'Status', 'Payment', 'Notes'],
      ...filtered.map(a => [a.name, a.phone, a.service, a.date, a.status, a.paymentStatus ?? 'unpaid', a.paymentNotes ?? '']),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `masdent-finance-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title={t('finance') || (isAr ? 'المالية والفواتير' : 'Billing & Finance')}
      subtitle={t('finance_subtitle') || (isAr ? 'تتبع المدفوعات وتصدير التقارير' : 'Track payments and export reports')}
      actions={
        <Button onClick={exportCSV} variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <span className="material-symbols-outlined text-sm">download</span>
          {t('export_csv') || (isAr ? 'تصدير CSV' : 'Export CSV')}
        </Button>
      }
    >
      {/* Period filter */}
      <div className="flex gap-2 mb-6">
        {(['7d','30d','90d','all'] as const).map(p => (
          <Button key={p} variant={period === p ? 'default' : 'outline'} onClick={() => setPeriod(p)} className="rounded-full text-xs">
            {p === 'all' ? (isAr ? 'الكل' : 'All') : p === '7d' ? (isAr ? '7 أيام' : '7 Days') : p === '30d' ? (isAr ? '30 يوم' : '30 Days') : (isAr ? '90 يوم' : '90 Days')}
          </Button>
        ))}
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: 'receipt_long', label: isAr ? 'إجمالي المواعيد' : 'Total Appts',   value: filtered.length, color: 'from-slate-500 to-slate-600' },
            { icon: 'check_circle', label: isAr ? 'مدفوع' : 'Paid',                    value: paid.length,     color: 'from-emerald-500 to-emerald-600' },
            { icon: 'pending',      label: isAr ? 'غير مدفوع' : 'Unpaid',              value: unpaid.length,   color: 'from-amber-400 to-amber-500' },
            { icon: 'percent',      label: isAr ? 'نسبة الدفع' : 'Payment Rate',       value: `${paidRate}%`,  color: 'from-teal-500 to-teal-600' },
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

      {/* Payment rate bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-slate-900">{isAr ? 'نسبة الدفع' : 'Payment Rate'}</h3>
            <span className="text-2xl font-black text-emerald-600">{paidRate}%</span>
          </div>
          <Progress value={paidRate} className="h-4 bg-slate-100" />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>{isAr ? `${paid.length} مدفوع` : `${paid.length} paid`}</span>
            <span>{isAr ? `${unpaid.length} غير مدفوع` : `${unpaid.length} unpaid`}</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly chart */}
      {monthlyArr.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-black text-slate-900 mb-5">{isAr ? 'توزيع المدفوعات الشهري' : 'Monthly Payment Distribution'}</h3>
            <div className="flex items-end gap-3 h-32">
              {monthlyArr.map((m, i) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '100px' }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(m.paid / maxMonthly) * 100}%` }} transition={{ delay: i * 0.07, duration: 0.5 }}
                      className="w-full bg-emerald-500 rounded-t-sm" style={{ minHeight: m.paid > 0 ? '4px' : '0' }} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(m.unpaid / maxMonthly) * 100}%` }} transition={{ delay: i * 0.07 + 0.1, duration: 0.5 }}
                      className="w-full bg-amber-400 rounded-none" style={{ minHeight: m.unpaid > 0 ? '4px' : '0' }} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium text-center leading-tight">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-500">{isAr ? 'مدفوع' : 'Paid'}</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-400" /><span className="text-xs text-slate-500">{isAr ? 'غير مدفوع' : 'Unpaid'}</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-black/5">
          <CardTitle className="text-lg font-black">{isAr ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
          <span className="text-xs text-slate-500">{filtered.length} {isAr ? 'سجل' : 'records'}</span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[isAr?'المريض':'Patient', isAr?'الخدمة':'Service', isAr?'التاريخ':'Date', isAr?'حالة الموعد':'Appt Status', isAr?'الدفع':'Payment', isAr?'ملاحظات':'Notes'].map(h => (
                      <TableHead key={h} className={isAr?'text-right':'text-left'}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((a, i) => (
                      <TableRow key={a._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <TableCell>
                          <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                          <p className="text-[11px] text-slate-500">{a.phone}</p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 max-w-[130px] truncate">{a.service}</TableCell>
                        <TableCell className="text-sm text-slate-600">{fd(a.date)}</TableCell>
                        <TableCell>
                          <Badge variant={a.status === 'completed' ? 'default' : a.status === 'confirmed' ? 'secondary' : a.status === 'cancelled' ? 'destructive' : 'outline'} className="text-[10px]">
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.paymentStatus === 'paid' ? 'default' : 'outline'} className={a.paymentStatus === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600 gap-1' : 'text-amber-600 border-amber-200 gap-1'}>
                            <span className="material-symbols-outlined text-[10px]">{a.paymentStatus === 'paid' ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {a.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid') : (isAr ? 'غير مدفوع' : 'Unpaid')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-slate-500 max-w-[120px] truncate">{a.paymentNotes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

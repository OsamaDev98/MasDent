"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Appointment {
  _id: string; name: string; phone: string; service: string;
  date: string; status: string; paymentStatus?: string; paymentNotes?: string; createdAt: string;
}

const STATUS_CFG: Record<string,{bg:string;color:string;icon:string}> = {
  completed:{ bg:'bg-emerald-50 border-emerald-200', color:'text-emerald-700', icon:'task_alt' },
  confirmed:{ bg:'bg-teal-50 border-teal-200',       color:'text-teal-700',    icon:'check_circle' },
  cancelled:{ bg:'bg-red-50 border-red-200',         color:'text-red-700',     icon:'cancel' },
  pending:  { bg:'bg-amber-50 border-amber-200',     color:'text-amber-700',   icon:'schedule' },
  'no-show':{ bg:'bg-slate-50 border-slate-200',     color:'text-slate-600',   icon:'person_off' },
};

const fd = (s: string, isAr: boolean) => { try { return new Date(s).toLocaleDateString(isAr?'ar-SA':'en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return s; } };

export default function AdminFinancePage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';

  const [appts, setAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<'all'|'7d'|'30d'|'90d'>('30d');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/appointments'); const j = await r.json(); setAppts(j.appointments ?? []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  const filtered = appts.filter(a => {
    if (period === 'all') return true;
    const days = { '7d':7,'30d':30,'90d':90 }[period] ?? 30;
    return (now - new Date(a.createdAt).getTime()) < days * 86400000;
  });

  const paid   = filtered.filter(a => a.paymentStatus === 'paid');
  const unpaid = filtered.filter(a => a.paymentStatus !== 'paid');
  const paidRate = filtered.length > 0 ? Math.round((paid.length / filtered.length) * 100) : 0;

  // Monthly chart data
  const monthlyData: Record<string,{paid:number;unpaid:number}> = {};
  filtered.forEach(a => {
    const key = new Date(a.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short'});
    if (!monthlyData[key]) monthlyData[key] = { paid:0, unpaid:0 };
    if (a.paymentStatus === 'paid') monthlyData[key].paid++;
    else monthlyData[key].unpaid++;
  });
  const monthlyArr = Object.entries(monthlyData).slice(-6).map(([m,v]) => ({ month:m, ...v }));
  const maxMonthly = Math.max(...monthlyArr.map(m => m.paid + m.unpaid), 1);

  const exportCSV = () => {
    const rows = [['Name','Phone','Service','Date','Status','Payment','Notes'],
      ...filtered.map(a => [a.name,a.phone,a.service,a.date,a.status,a.paymentStatus??'unpaid',a.paymentNotes??''])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href=url; link.download=`masdent-finance-${period}.csv`; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell
      title={isAr ? 'المالية والفواتير' : 'Billing & Finance'}
      subtitle={isAr ? 'تتبع المدفوعات وتصدير التقارير' : 'Track payments and export reports'}
      actions={
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/80 border border-emerald-400/50 text-white text-sm font-bold hover:bg-emerald-500 backdrop-blur-sm transition-all shadow-lg shadow-emerald-500/20">
          <span className="material-symbols-outlined text-sm">download</span>
          {isAr ? 'تصدير CSV' : 'Export CSV'}
        </button>
      }
    >
      {/* Period filter */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 mb-5 flex gap-1 w-fit">
        {(['7d','30d','90d','all'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${period===p
              ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-500/25'
              : 'text-slate-500 hover:bg-slate-50'}`}>
            {p==='all'?(isAr?'الكل':'All'):p==='7d'?(isAr?'7 أيام':'7 Days'):p==='30d'?(isAr?'30 يوم':'30 Days'):(isAr?'90 يوم':'90 Days')}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { icon:'receipt_long', label:isAr?'إجمالي المواعيد':'Total Appts', value:filtered.length, gradient:'from-slate-500 to-slate-600',   glow:'shadow-slate-400/20' },
          { icon:'check_circle', label:isAr?'مدفوع':'Paid',                  value:paid.length,     gradient:'from-emerald-500 to-green-500', glow:'shadow-emerald-500/20' },
          { icon:'pending',      label:isAr?'غير مدفوع':'Unpaid',            value:unpaid.length,   gradient:'from-amber-400 to-orange-500',  glow:'shadow-amber-500/20' },
          { icon:'percent',      label:isAr?'نسبة الدفع':'Payment Rate',     value:`${paidRate}%`,  gradient:'from-teal-500 to-teal-600',     glow:'shadow-teal-500/20' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            {loading ? <Skeleton className="h-28 rounded-3xl" /> : (
              <div className={`relative bg-white rounded-3xl p-5 border border-slate-100 shadow-lg ${s.glow} overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
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

      {/* Payment Rate Bar */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-black text-slate-900">{isAr?'نسبة الدفع':'Payment Rate'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{isAr?`${paid.length} مدفوع · ${unpaid.length} غير مدفوع`:`${paid.length} paid · ${unpaid.length} unpaid`}</p>
          </div>
          <span className="text-3xl font-black text-emerald-600 tabular-nums">{paidRate}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width:0 }} animate={{ width:`${paidRate}%` }} transition={{ duration:0.8, ease:[0.22,1,0.36,1] }} />
        </div>
      </motion.div>

      {/* Monthly chart */}
      {monthlyArr.length > 0 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-slate-900">{isAr?'التوزيع الشهري':'Monthly Distribution'}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span className="text-xs text-slate-400 font-medium">{isAr?'مدفوع':'Paid'}</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-xs text-slate-400 font-medium">{isAr?'غير مدفوع':'Unpaid'}</span></div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-32">
            {monthlyArr.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex flex-col justify-end gap-0.5 relative" style={{ height:'100px' }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10">
                    <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
                      {m.paid}✔ {m.unpaid}✗
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                  <motion.div initial={{ height:0 }} animate={{ height:`${(m.paid/maxMonthly)*100}%` }} transition={{ delay:i*0.07, duration:0.5 }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400" style={{ minHeight: m.paid>0?'4px':'0' }} />
                  <motion.div initial={{ height:0 }} animate={{ height:`${(m.unpaid/maxMonthly)*100}%` }} transition={{ delay:i*0.07+0.1, duration:0.5 }}
                    className="w-full bg-amber-400" style={{ minHeight: m.unpaid>0?'4px':'0' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{m.month.slice(0,3)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transactions table */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h3 className="font-black text-slate-900">{isAr?'سجل المعاملات':'Transaction History'}</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-xl font-bold">{filtered.length} {isAr?'سجل':'records'}</span>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  {[isAr?'المريض':'Patient', isAr?'الخدمة':'Service', isAr?'التاريخ':'Date', isAr?'حالة الموعد':'Status', isAr?'الدفع':'Payment', isAr?'ملاحظات':'Notes'].map(h => (
                    <TableHead key={h} className={`h-12 font-black text-slate-500 text-xs uppercase tracking-wide ${isAr?'text-right':'text-left'}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((a, i) => {
                    const scfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending;
                    return (
                      <motion.tr key={a._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.025 }}
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
                        <TableCell><span className="text-xs font-semibold text-slate-700 max-w-[130px] truncate block">{a.service}</span></TableCell>
                        <TableCell><span className="text-sm font-bold text-slate-900">{fd(a.date, isAr)}</span></TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${scfg.bg} ${scfg.color}`}>
                            <span className="material-symbols-outlined text-[13px]">{scfg.icon}</span>{a.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold ${
                            a.paymentStatus === 'paid'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            <span className="material-symbols-outlined text-[13px]">{a.paymentStatus==='paid'?'check_circle':'radio_button_unchecked'}</span>
                            {a.paymentStatus==='paid'?(isAr?'مدفوع':'Paid'):(isAr?'غير مدفوع':'Unpaid')}
                          </div>
                        </TableCell>
                        <TableCell><span className="text-[11px] text-slate-400 max-w-[120px] truncate block">{a.paymentNotes||'—'}</span></TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </DashboardShell>
  );
}

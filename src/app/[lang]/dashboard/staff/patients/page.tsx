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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Patient {
  _id: string; name: string; phone: string; email?: string;
  gender?: string; dateOfBirth?: string; notes?: string; lastVisit?: string; createdAt: string;
}
interface Appointment {
  _id: string; service: string; date: string; status: string;
}

const patientSchema = z.object({
  name:        z.string().min(2, 'Name required'),
  phone:       z.string().min(7, 'Phone required'),
  email:       z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender:      z.enum(['male', 'female', 'other']).optional(),
  address:     z.string().optional(),
  notes:       z.string().optional(),
});
type PatientForm = z.infer<typeof patientSchema>;

export default function StaffPatientsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Patient | null>(null);
  const [selAppts, setSelAppts] = useState<Appointment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PatientForm>({ resolver: zodResolver(patientSchema) });

  const load = useCallback(async () => {
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : '';
      const r = await fetch(`/api/patients${q}`);
      const j = await r.json();
      setPatients(j.patients ?? []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openPatient = async (p: Patient) => {
    setSel(p);
    const r = await fetch(`/api/patients/${p._id}`);
    const j = await r.json();
    setSelAppts(j.appointments ?? []);
  };

  const onSave = async (data: PatientForm) => {
    setSaving(true);
    const tid = toast.loading(isAr ? 'جارٍ الحفظ...' : 'Saving...');
    try {
      if (editing && sel) {
        await fetch(`/api/patients/${sel._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        toast.success(isAr ? 'تم تحديث بيانات المريض' : 'Patient updated!', { id: tid });
      } else {
        await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        toast.success(isAr ? 'تمت إضافة المريض بنجاح' : 'Patient added!', { id: tid });
      }
      reset(); setShowAdd(false); setEditing(false); load();
    } catch {
      toast.error(isAr ? 'حدث خطأ' : 'Something went wrong', { id: tid });
    } finally { setSaving(false); }
  };

  const startEdit = () => {
    if (!sel) return;
    setEditing(true);
    setValue('name', sel.name);
    setValue('phone', sel.phone);
    setValue('email', sel.email ?? '');
    setValue('dateOfBirth', sel.dateOfBirth ?? '');
    setValue('gender', (sel.gender as 'male' | 'female' | 'other') ?? 'other');
    setValue('notes', sel.notes ?? '');
    setShowAdd(true);
  };

  const fd = (s: string) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s; } };

  const STATUS_COLORS: Record<string, string> = {
    confirmed: 'text-teal-600', completed: 'text-emerald-600',
    cancelled: 'text-red-500', pending: 'text-amber-600', 'no-show': 'text-slate-400',
  };

  return (
    <DashboardShell
      title={t('patients') || (isAr ? 'المرضى' : 'Patients')}
      subtitle={t('patients_subtitle') || (isAr ? 'ابحث وأدر بيانات المرضى' : 'Search and manage patient records')}
      actions={
        <Button onClick={() => { setEditing(false); reset(); setShowAdd(true); }} className="gap-2">
          <span className="material-symbols-outlined text-sm">person_add</span>
          {t('new_patient') || (isAr ? 'مريض جديد' : 'New Patient')}
        </Button>
      }
    >
      {/* Search */}
      <div className="relative mb-5">
        <span className={`material-symbols-outlined absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-lg`}>search</span>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? 'بحث بالاسم أو الهاتف أو البريد...' : 'Search by name, phone or email...'}
          className={`py-6 text-base ${isAr ? 'pr-10' : 'pl-10'}`} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col items-center py-16">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">group</span>
          <p className="font-bold text-slate-600">{isAr ? 'لا يوجد مرضى' : 'No patients found'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {patients.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => openPatient(p)}>
                <Card className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary-dark font-black flex items-center justify-center text-lg shrink-0">
                        {p.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.phone}</p>
                      </div>
                    </div>
                    {p.email && <p className="text-xs text-slate-500 mb-1 truncate">{p.email}</p>}
                    {p.lastVisit && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">history</span>
                        {isAr ? 'آخر زيارة: ' : 'Last visit: '}{fd(p.lastVisit)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Patient detail modal */}
      <AnimatePresence>
        {sel && !showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSel(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary-dark font-black flex items-center justify-center text-2xl">{sel.name[0].toUpperCase()}</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{sel.name}</h3>
                    <p className="text-slate-500 text-sm">{sel.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={startEdit} className="text-slate-500 hover:text-primary-dark">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSel(null)} className="text-slate-400 hover:text-slate-700">
                    <span className="material-symbols-outlined">close</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: isAr ? 'البريد' : 'Email',             value: sel.email || '—' },
                  { label: isAr ? 'تاريخ الميلاد' : 'Birth Date', value: sel.dateOfBirth ? fd(sel.dateOfBirth) : '—' },
                  { label: isAr ? 'الجنس' : 'Gender',             value: sel.gender || '—' },
                  { label: isAr ? 'آخر زيارة' : 'Last Visit',     value: sel.lastVisit ? fd(sel.lastVisit) : '—' },
                ].map(r => (
                  <div key={r.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{r.label}</p>
                    <p className="text-slate-800 font-medium text-sm mt-0.5">{r.value}</p>
                  </div>
                ))}
              </div>
              {sel.notes && <div className="bg-slate-50 rounded-xl p-3 mb-5"><p className="text-[10px] text-slate-500 font-bold uppercase">{isAr ? 'ملاحظات' : 'Notes'}</p><p className="text-sm text-slate-700 mt-1">{sel.notes}</p></div>}

              {/* Appointment history */}
              {selAppts.length > 0 && (
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'سجل المواعيد' : 'Appointment History'}</p>
                  <div className="space-y-2">
                    {selAppts.map(a => (
                      <div key={a._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{a.service}</p>
                          <p className="text-xs text-slate-500">{fd(a.date)}</p>
                        </div>
                        <span className={`text-xs font-bold ${STATUS_COLORS[a.status] ?? 'text-slate-500'}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp / Call */}
              <div className="flex gap-3 mt-5">
                <a href={`tel:${sel.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors">
                  <span className="material-symbols-outlined text-sm">call</span>{isAr ? 'اتصال' : 'Call'}
                </a>
                <a href={`https://wa.me/${sel.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
                  <span className="material-symbols-outlined text-sm">chat</span>WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowAdd(false); setEditing(false); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">{editing ? (isAr ? 'تعديل المريض' : 'Edit Patient') : (isAr ? 'مريض جديد' : 'New Patient')}</h3>
                <button onClick={() => { setShowAdd(false); setEditing(false); }} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                {[
                  { name: 'name' as const,        label: isAr ? 'الاسم الكامل' : 'Full Name',    type: 'text' },
                  { name: 'phone' as const,       label: isAr ? 'رقم الهاتف' : 'Phone',          type: 'tel' },
                  { name: 'email' as const,       label: isAr ? 'البريد الإلكتروني' : 'Email',   type: 'email' },
                  { name: 'dateOfBirth' as const, label: isAr ? 'تاريخ الميلاد' : 'Date of Birth', type: 'date' },
                ].map(f => (
                  <div key={f.name}>
                    <Label className="block mb-2">{f.label}</Label>
                    <Input type={f.type} {...register(f.name)} className={errors[f.name] ? 'border-red-500' : ''} />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{String(errors[f.name]?.message)}</p>}
                  </div>
                ))}
                <div>
                  <Label className="block mb-2">{isAr ? 'الجنس' : 'Gender'}</Label>
                  <select {...register('gender')} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="other">{isAr ? 'غير محدد' : 'Not specified'}</option>
                    <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
                    <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
                <div>
                  <Label className="block mb-2">{isAr ? 'ملاحظات' : 'Notes'}</Label>
                  <textarea {...register('notes')} rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                </div>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : editing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المريض' : 'Add Patient')}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

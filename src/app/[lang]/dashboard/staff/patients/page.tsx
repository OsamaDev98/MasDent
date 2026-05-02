"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Patient {
  _id: string; name: string; phone: string; email?: string;
  gender?: string; dateOfBirth?: string; notes?: string; lastVisit?: string; images?: string[]; createdAt: string;
}
interface Appointment { _id: string; service: string; date: string; status: string; }

const patientSchema = z.object({
  name: z.string().min(2), phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(), gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(), notes: z.string().optional(), images: z.array(z.string()).optional(),
});
type PatientForm = z.infer<typeof patientSchema>;

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-teal-600', completed: 'text-emerald-600',
  cancelled: 'text-red-500', pending: 'text-amber-600', 'no-show': 'text-slate-400',
};

const fd = (s: string, isAr: boolean) => { try { return new Date(s).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return s; } };

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
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm<PatientForm>({ resolver: zodResolver(patientSchema) });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        setValue('images', [...(getValues('images') || []), b64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    const imgs = [...(getValues('images') || [])];
    imgs.splice(idx, 1); setValue('images', imgs);
  };

  const load = useCallback(async () => {
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : '';
      const r = await fetch(`/api/patients${q}`);
      const j = await r.json();
      setPatients(j.patients ?? []);
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const openPatient = async (p: Patient) => {
    setSel(p);
    const r = await fetch(`/api/patients/${p._id}`);
    const j = await r.json();
    setSelAppts(j.appointments ?? []);
  };

  const onSave = async (data: PatientForm) => {
    setSaving(true);
    const finalData = { ...data, images: getValues('images') || [] };
    try {
      let res;
      if (editing && sel) {
        res = await fetch(`/api/patients/${sel._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
      } else {
        res = await fetch('/api/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
      }
      if (!res.ok) { if (res.status === 413) throw new Error(isAr ? 'الصور كبيرة جداً (حد 2MB)' : 'Images too large (max 2MB)'); throw new Error('Failed'); }
      toast.success(isAr ? 'تم حفظ بيانات المريض' : 'Patient saved!');
      reset(); setShowAdd(false); setEditing(false); load();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const startEdit = () => {
    if (!sel) return;
    setEditing(true);
    setValue('name', sel.name); setValue('phone', sel.phone);
    setValue('email', sel.email ?? ''); setValue('dateOfBirth', sel.dateOfBirth ?? '');
    setValue('gender', (sel.gender as 'male' | 'female' | 'other') ?? 'other');
    setValue('notes', sel.notes ?? ''); setValue('images', sel.images ?? []);
    setShowAdd(true);
  };

  const GENDER_ICON: Record<string, string> = { male: 'man', female: 'woman', other: 'person' };

  return (
    <DashboardShell
      title={isAr ? 'المرضى' : 'Patients'}
      subtitle={isAr ? 'ابحث وأدر بيانات المرضى' : 'Search and manage patient records'}
      actions={
        <button onClick={() => { setEditing(false); reset(); setShowAdd(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-bold hover:bg-white/25 backdrop-blur-sm transition-all">
          <span className="material-symbols-outlined text-sm">person_add</span>
          {isAr ? 'مريض جديد' : 'New Patient'}
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-5">
        <span className={`material-symbols-outlined absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-slate-400 text-lg`}>search</span>
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isAr ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
          className={`h-12 rounded-2xl bg-white border-slate-200 shadow-sm text-sm ${isAr ? 'pr-11' : 'pl-11'}`} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">group</span>
          </div>
          <p className="font-bold text-slate-700">{isAr ? 'لا يوجد مرضى' : 'No patients found'}</p>
          <p className="text-slate-400 text-sm mt-1">{isAr ? 'أضف أول مريض' : 'Add your first patient'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {patients.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => openPatient(p)} className="cursor-pointer group">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-teal-200 transition-all duration-300 p-5 overflow-hidden relative">
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 opacity-0 group-hover:opacity-10 rounded-full blur-xl transition-opacity" />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-100 text-teal-700 font-black flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.phone}</p>
                    </div>
                    {p.gender && (
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-[16px]">{GENDER_ICON[p.gender] ?? 'person'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    {p.email ? (
                      <p className="text-[11px] text-slate-400 truncate flex-1">{p.email}</p>
                    ) : <span />}
                    {p.lastVisit && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-slate-300 text-xs">history</span>
                        <span className="text-[11px] text-slate-400">{fd(p.lastVisit, isAr)}</span>
                      </div>
                    )}
                  </div>
                  {(p.images?.length ?? 0) > 0 && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-md bg-teal-100 border border-teal-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-teal-600 text-[11px]">image</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {sel && !showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => setSel(null)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh]">

              {/* Header */}
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
                      <p className="text-teal-200/70 text-sm mt-0.5">{sel.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={startEdit} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => setSel(null)} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-7 -mt-4 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: isAr ? 'البريد' : 'Email', value: sel.email || '—', icon: 'mail' },
                    { label: isAr ? 'تاريخ الميلاد' : 'Birth', value: sel.dateOfBirth ? fd(sel.dateOfBirth, isAr) : '—', icon: 'cake' },
                    { label: isAr ? 'الجنس' : 'Gender', value: sel.gender || '—', icon: 'person' },
                    { label: isAr ? 'آخر زيارة' : 'Last Visit', value: sel.lastVisit ? fd(sel.lastVisit, isAr) : '—', icon: 'history' },
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
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1.5">{isAr ? 'ملاحظات' : 'Notes'}</p>
                    <p className="text-sm text-amber-900">{sel.notes}</p>
                  </div>
                )}

                {(sel.images?.length ?? 0) > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'الصور' : 'Images'}</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {sel.images!.map((img, i) => (
                        <img key={i} src={img} alt="" onClick={() => setGalleryIndex(i)}
                          className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 hover:scale-105 transition-all shrink-0" />
                      ))}
                    </div>
                  </div>
                )}

                {selAppts.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isAr ? 'سجل المواعيد' : 'Appointment History'}</p>
                    <div className="space-y-2">
                      {selAppts.map(a => (
                        <div key={a._id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{a.service}</p>
                            <p className="text-xs text-slate-400">{fd(a.date, isAr)}</p>
                          </div>
                          <span className={`text-xs font-bold ${STATUS_COLORS[a.status] ?? 'text-slate-500'}`}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <a href={`tel:${sel.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-sm">call</span>{isAr ? 'اتصال' : 'Call'}
                  </a>
                  <a href={`https://wa.me/${sel.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-md shadow-emerald-200">
                    <span className="material-symbols-outlined text-sm">chat</span>WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => { setShowAdd(false); setEditing(false); }}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh]">

              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">{editing ? 'edit' : 'person_add'}</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{editing ? (isAr ? 'تعديل المريض' : 'Edit Patient') : (isAr ? 'مريض جديد' : 'New Patient')}</h3>
                  </div>
                  <button onClick={() => { setShowAdd(false); setEditing(false); }} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7 overflow-y-auto max-h-[65vh]">
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                  {[
                    { name: 'name' as const, label: isAr ? 'الاسم الكامل' : 'Full Name', type: 'text', icon: 'person' },
                    { name: 'phone' as const, label: isAr ? 'رقم الهاتف' : 'Phone', type: 'tel', icon: 'call' },
                    { name: 'email' as const, label: isAr ? 'البريد الإلكتروني' : 'Email', type: 'email', icon: 'mail' },
                    { name: 'dateOfBirth' as const, label: isAr ? 'تاريخ الميلاد' : 'Date of Birth', type: 'date', icon: 'cake' },
                  ].map(f => (
                    <div key={f.name}>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{f.label}</Label>
                      <div className="relative">
                        <span className={`material-symbols-outlined absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-[18px]`}>{f.icon}</span>
                        <Input type={f.type} {...register(f.name)} className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${isAr ? 'pr-10' : 'pl-10'} ${errors[f.name] ? 'border-red-400' : ''}`} />
                      </div>
                    </div>
                  ))}

                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr ? 'الجنس' : 'Gender'}</Label>
                    <select {...register('gender')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                      <option value="other">{isAr ? 'غير محدد' : 'Not specified'}</option>
                      <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
                      <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
                    </select>
                  </div>

                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr ? 'ملاحظات' : 'Notes'}</Label>
                    <textarea {...register('notes')} rows={3}
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none" />
                  </div>

                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr ? 'الصور' : 'Images'}</Label>
                    <div className="flex flex-wrap gap-3">
                      {(watch('images') || []).map((img, i) => (
                        <div key={i} className="relative group w-20 h-20">
                          <img src={img} alt="" className="w-full h-full object-cover rounded-2xl border border-slate-200" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-teal-400 hover:text-teal-500 cursor-pointer transition-colors bg-slate-50">
                        <span className="material-symbols-outlined">add_photo_alternate</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      : <><span className="material-symbols-outlined text-sm">{editing ? 'save' : 'person_add'}</span>{editing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المريض' : 'Add Patient')}</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery */}
      <AnimatePresence>
        {galleryIndex !== null && sel?.images && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4">
            <button onClick={() => setGalleryIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            {sel.images.length > 1 && (<>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
                onClick={() => setGalleryIndex(galleryIndex === 0 ? sel.images!.length - 1 : galleryIndex - 1)}>
                <span className="material-symbols-outlined text-3xl">chevron_left</span>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white z-10 transition-colors"
                onClick={() => setGalleryIndex(galleryIndex === sel.images!.length - 1 ? 0 : galleryIndex + 1)}>
                <span className="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
            </>)}
            <motion.img key={galleryIndex} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              src={sel.images[galleryIndex]} alt="" className="max-w-full max-h-[90vh] object-contain select-none rounded-2xl" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
              {galleryIndex + 1} / {sel.images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

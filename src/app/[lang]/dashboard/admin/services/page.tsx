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

interface Service {
  _id: string; name: string; nameAr: string; price: number;
  duration: number; category: string; description?: string; isActive: boolean;
}
const serviceSchema = z.object({
  name: z.string().min(2), nameAr: z.string().min(2),
  price: z.number().min(0), duration: z.number().min(5),
  category: z.string().min(1), description: z.string().optional(),
});
type ServiceForm = z.infer<typeof serviceSchema>;

const CATEGORIES = ['General','Cosmetic','Orthodontics','Surgery','Preventive','Emergency'];
const CAT_ICONS: Record<string,string> = {
  General:'medical_services', Cosmetic:'auto_fix_high', Orthodontics:'straighten',
  Surgery:'surgical', Preventive:'health_and_safety', Emergency:'emergency',
};
const CAT_COLORS: Record<string,string> = {
  General:'from-teal-500 to-teal-600', Cosmetic:'from-pink-500 to-rose-500',
  Orthodontics:'from-blue-500 to-indigo-500', Surgery:'from-red-500 to-rose-600',
  Preventive:'from-emerald-500 to-green-500', Emergency:'from-amber-500 to-orange-500',
};

export default function AdminServicesPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Service | null>(null);
  const [saving, setSaving]     = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceForm>({ resolver: zodResolver(serviceSchema) });

  const load = useCallback(async () => {
    try { const r = await fetch('/api/services'); const j = await r.json(); setServices(j.services ?? []); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSave = async (data: ServiceForm) => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/services/${editing._id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        toast.success(isAr ? 'تم تحديث الخدمة' : 'Service updated!');
      } else {
        await fetch('/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        toast.success(isAr ? 'تمت إضافة الخدمة' : 'Service added!');
      }
      reset(); setShowForm(false); setEditing(null); load();
    } finally { setSaving(false); }
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/services/${s._id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ isActive: !s.isActive }) });
    load();
  };

  const deleteService = async (id: string) => {
    await fetch(`/api/services/${id}`, { method:'DELETE' });
    toast.success(isAr ? 'تم حذف الخدمة' : 'Service deleted');
    load();
  };

  const startEdit = (s: Service) => {
    setEditing(s);
    setValue('name', s.name); setValue('nameAr', s.nameAr);
    setValue('price', s.price); setValue('duration', s.duration);
    setValue('category', s.category); setValue('description', s.description ?? '');
    setShowForm(true);
  };

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];
  const filtered = catFilter === 'all' ? services : services.filter(s => s.category === catFilter);

  return (
    <DashboardShell
      title={isAr ? 'إدارة الخدمات' : 'Services Management'}
      subtitle={isAr ? 'أضف وعدّل خدمات العيادة والأسعار' : 'Add and manage clinic services and pricing'}
      actions={
        <button onClick={() => { setEditing(null); reset(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-sm font-bold hover:bg-white/25 backdrop-blur-sm transition-all">
          <span className="material-symbols-outlined text-sm">add</span>
          {isAr ? 'خدمة جديدة' : 'New Service'}
        </button>
      }
    >
      {/* Category filter bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-2 mb-5 flex gap-1 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${catFilter === c
              ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-500/25'
              : 'text-slate-600 hover:bg-slate-50'}`}>
            {c === 'all' ? (isAr ? 'الكل' : 'All') : c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((s, i) => {
              const grad = CAT_COLORS[s.category] ?? 'from-teal-500 to-teal-600';
              return (
                <motion.div key={s._id} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay: i*0.04 }}>
                  <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group relative ${!s.isActive ? 'opacity-60 grayscale' : ''}`}>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${grad}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md`}>
                          <span className="material-symbols-outlined text-white text-xl">{CAT_ICONS[s.category] ?? 'medical_services'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleActive(s)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${s.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                            <span className="material-symbols-outlined text-sm">{s.isActive ? 'toggle_on' : 'toggle_off'}</span>
                          </button>
                          <button onClick={() => startEdit(s)}
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => deleteService(s._id)}
                            className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      <h3 className="font-black text-slate-900">{isAr ? s.nameAr : s.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>
                      {s.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description}</p>}

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                          <span className="material-symbols-outlined text-emerald-500 text-sm">payments</span>
                          <span className="text-sm font-black text-emerald-700">${s.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100">
                          <span className="material-symbols-outlined text-blue-500 text-sm">schedule</span>
                          <span className="text-sm font-bold text-blue-700">{s.duration}m</span>
                        </div>
                        {!s.isActive && (
                          <span className="ml-auto text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                            {isAr ? 'غير نشط' : 'INACTIVE'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-slate-100 flex flex-col items-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-slate-300">medical_services</span>
              </div>
              <p className="font-bold text-slate-600">{isAr ? 'لا توجد خدمات' : 'No services yet'}</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
            onClick={() => { setShowForm(false); setEditing(null); }}>
            <motion.div initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh]">

              <div className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-7 py-6 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage:'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize:'24px 24px' }} />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">medical_services</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{editing?(isAr?'تعديل الخدمة':'Edit Service'):(isAr?'خدمة جديدة':'New Service')}</h3>
                  </div>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>

              <div className="p-7 overflow-y-auto">
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'الاسم (EN)':'Name (EN)'}</Label>
                      <Input {...register('name')} className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${errors.name?'border-red-400':''}`} />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'الاسم (AR)':'Name (AR)'}</Label>
                      <Input {...register('nameAr')} dir="rtl" className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${errors.nameAr?'border-red-400':''}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'السعر ($)':'Price ($)'}</Label>
                      <Input type="number" min="0" {...register('price',{valueAsNumber:true})} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                    <div>
                      <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'المدة (دقيقة)':'Duration (min)'}</Label>
                      <Input type="number" min="5" {...register('duration',{valueAsNumber:true})} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                  </div>
                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'التصنيف':'Category'}</Label>
                    <select {...register('category')} className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="block mb-1.5 text-sm font-bold text-slate-700">{isAr?'الوصف':'Description'}</Label>
                    <textarea {...register('description')} rows={3}
                      className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none" />
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      : <><span className="material-symbols-outlined text-sm">{editing?'save':'add'}</span>{editing?(isAr?'حفظ التعديلات':'Save Changes'):(isAr?'إضافة الخدمة':'Add Service')}</>}
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

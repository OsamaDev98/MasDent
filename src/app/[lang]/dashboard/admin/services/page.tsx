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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Service {
  _id: string; name: string; nameAr: string; price: number;
  duration: number; category: string; description?: string; isActive: boolean;
}

const serviceSchema = z.object({
  name:        z.string().min(2, 'Name required'),
  nameAr:      z.string().min(2, 'Arabic name required'),
  price:       z.number({ message: 'Price required' }).min(0),
  duration:    z.number({ message: 'Duration required' }).min(5),
  category:    z.string().min(1, 'Category required'),
  description: z.string().optional(),
});
type ServiceForm = z.infer<typeof serviceSchema>;

const CATEGORIES = ['General', 'Cosmetic', 'Orthodontics', 'Surgery', 'Preventive', 'Emergency'];
const CATEGORY_ICONS: Record<string, string> = {
  General: 'medical_services', Cosmetic: 'auto_fix_high',
  Orthodontics: 'straighten', Surgery: 'surgical', Preventive: 'health_and_safety', Emergency: 'emergency',
};

export default function AdminServicesPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ServiceForm>({ resolver: zodResolver(serviceSchema) });

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/services');
      const j = await r.json();
      setServices(j.services ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSave = async (data: ServiceForm) => {
    setSaving(true);
    const tid = toast.loading(isAr ? 'جارٍ الحفظ...' : 'Saving...');
    try {
      if (editing) {
        await fetch(`/api/services/${editing._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        toast.success(isAr ? 'تم تحديث الخدمة' : 'Service updated!', { id: tid });
      } else {
        await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        toast.success(isAr ? 'تمت إضافة الخدمة' : 'Service added!', { id: tid });
      }
      reset(); setShowForm(false); setEditing(null); load();
    } finally { setSaving(false); }
  };

  const toggleActive = async (s: Service) => {
    await fetch(`/api/services/${s._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.isActive }) });
    load();
  };

  const deleteService = async (id: string) => {
    const tid = toast.loading(isAr ? 'جارٍ الحذف...' : 'Deleting...');
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    toast.success(isAr ? 'تم حذف الخدمة' : 'Service deleted', { id: tid });
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
      title={t('services_management') || (isAr ? 'إدارة الخدمات' : 'Services Management')}
      subtitle={t('services_subtitle') || (isAr ? 'أضف وعدّل خدمات العيادة والأسعار' : 'Add and manage clinic services and pricing')}
      actions={
        <Button onClick={() => { setEditing(null); reset(); setShowForm(true); }} className="gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          {t('new_service') || (isAr ? 'خدمة جديدة' : 'New Service')}
        </Button>
      }
    >
      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer transition-all ${catFilter === c ? 'bg-primary-dark text-white shadow-md' : 'bg-white border border-black/10 text-slate-600 hover:border-primary/30'}`}>
            {c === 'all' ? (isAr ? 'الكل' : 'All') : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex justify-between mb-3">
                  <Skeleton className="w-11 h-11 rounded-xl" />
                  <div className="flex gap-1"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="w-8 h-8 rounded-lg" /></div>
                </div>
                <Skeleton className="w-3/4 h-5 mb-2" />
                <Skeleton className="w-1/4 h-4 mb-4" />
                <Skeleton className="w-full h-8" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`transition-all overflow-hidden ${!s.isActive ? 'opacity-60 grayscale' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary-dark text-xl">{CATEGORY_ICONS[s.category] ?? 'medical_services'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(s)} title={s.isActive ? 'Deactivate' : 'Activate'}
                          className={`w-8 h-8 rounded-lg ${s.isActive ? 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700' : 'text-slate-400'}`}>
                          <span className="material-symbols-outlined text-sm">{s.isActive ? 'toggle_on' : 'toggle_off'}</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="w-8 h-8 rounded-lg text-slate-500 hover:text-primary-dark">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteService(s._id)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-black text-slate-900 text-base">{isAr ? s.nameAr : s.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>
                    {s.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description}</p>}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-black/5">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 gap-1.5 px-3 py-1">
                        <span className="material-symbols-outlined text-xs">payments</span>
                        <span className="font-black text-sm">${s.price}</span>
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 gap-1.5 px-3 py-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span className="font-bold text-sm">{s.duration}m</span>
                      </Badge>
                      {!s.isActive && <Badge variant="outline" className="ml-auto text-[10px]">{isAr ? 'غير نشط' : 'INACTIVE'}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && !loading && (
            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-black/5 flex flex-col items-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">medical_services</span>
              <p className="font-bold text-slate-600">{isAr ? 'لا توجد خدمات' : 'No services yet'}</p>
              <p className="text-slate-400 text-sm mt-1">{isAr ? 'أضف أول خدمة لعيادتك' : 'Add your first clinic service'}</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowForm(false); setEditing(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">{editing ? (isAr ? 'تعديل الخدمة' : 'Edit Service') : (isAr ? 'إضافة خدمة جديدة' : 'New Service')}</h3>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-700 cursor-pointer"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">{isAr ? 'الاسم (EN)' : 'Name (EN)'}</Label>
                    <Input {...register('name')} className={errors.name ? 'border-red-500' : ''} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label className="mb-2 block">{isAr ? 'الاسم (AR)' : 'Name (AR)'}</Label>
                    <Input {...register('nameAr')} dir="rtl" className={errors.nameAr ? 'border-red-500' : ''} />
                    {errors.nameAr && <p className="text-red-500 text-xs mt-1">{errors.nameAr.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">{isAr ? 'السعر ($)' : 'Price ($)'}</Label>
                    <Input type="number" min="0" {...register('price', { valueAsNumber: true })} className={errors.price ? 'border-red-500' : ''} />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <Label className="mb-2 block">{isAr ? 'المدة (دقيقة)' : 'Duration (min)'}</Label>
                    <Input type="number" min="5" {...register('duration', { valueAsNumber: true })} className={errors.duration ? 'border-red-500' : ''} />
                    {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">{isAr ? 'التصنيف' : 'Category'}</Label>
                  <select {...register('category')} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block">{isAr ? 'الوصف' : 'Description'}</Label>
                  <textarea {...register('description')} rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  {saving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : editing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الخدمة' : 'Add Service')}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

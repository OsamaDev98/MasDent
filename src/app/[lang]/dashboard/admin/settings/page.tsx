"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const clinicSchema = z.object({
  clinicName:   z.string().min(2),
  clinicNameAr: z.string().min(2),
  phone:        z.string().min(7),
  email:        z.string().email(),
  address:      z.string().min(5),
  addressAr:    z.string().min(5),
  workStart:    z.string(),
  workEnd:      z.string(),
  workDays:     z.array(z.string()).min(1),
  breakStart:   z.string().optional(),
  breakEnd:     z.string().optional(),
  whatsapp:     z.string().optional(),
});
type ClinicForm = z.infer<typeof clinicSchema>;

const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

const TABS = [
  { id:'clinic'        as const, icon:'business',     en:'Clinic Info',    ar:'معلومات العيادة' },
  { id:'schedule'      as const, icon:'schedule',      en:'Schedule',       ar:'ساعات العمل' },
  { id:'notifications' as const, icon:'notifications', en:'Notifications',  ar:'الإشعارات' },
];

const INTEGRATIONS = [
  { icon:'chat',           name:'WhatsApp Business API', status:'configure', en:'Available',   ar:'متاح',   badgeClass:'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { icon:'sms',            name:'SMS Notifications',     status:'soon',      en:'Coming Soon', ar:'قريباً', badgeClass:'bg-slate-50 border-slate-200 text-slate-500' },
  { icon:'email',          name:'Email Service',         status:'soon',      en:'Coming Soon', ar:'قريباً', badgeClass:'bg-slate-50 border-slate-200 text-slate-500' },
  { icon:'calendar_month', name:'Google Calendar',       status:'soon',      en:'Coming Soon', ar:'قريباً', badgeClass:'bg-slate-50 border-slate-200 text-slate-500' },
];

const DEFAULT_NOTIFICATIONS = [
  { key:'reminder_24h', en:'Appointment reminder (24h before)', ar:'تذكير الموعد (قبل 24 ساعة)', enabled:true },
  { key:'new_appt',     en:'New appointment confirmation',       ar:'تأكيد الموعد الجديد',         enabled:true },
  { key:'cancellation', en:'Cancellation notification',          ar:'إشعار إلغاء الموعد',          enabled:false },
  { key:'no_show',      en:'No-show alert',                      ar:'إشعار الغياب',                enabled:false },
];

const InputField = ({ label, icon, isAr, error, children }: { label:string; icon:string; isAr:boolean; error?:string; children: React.ReactNode }) => (
  <div>
    <Label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-slate-500">{label}</Label>
    <div className="relative">
      <span className={`material-symbols-outlined absolute ${isAr?'right-3':'left-3'} top-1/2 -translate-y-1/2 text-slate-400 text-[18px]`}>{icon}</span>
      <div className={isAr ? 'pr-10' : 'pl-10'}>{children}</div>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function AdminSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'clinic'|'schedule'|'notifications'>('clinic');
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [workDays, setWorkDays]   = useState(['Sunday','Monday','Tuesday','Wednesday','Thursday']);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const { register, reset, trigger, getValues, watch, setValue, formState: { errors } } = useForm<ClinicForm>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName:'Mas Dent', clinicNameAr:'ماس دينت',
      workStart:'09:00', workEnd:'18:00', breakStart:'13:00', breakEnd:'14:00',
      workDays: ['Sunday','Monday','Tuesday','Wednesday','Thursday'],
    },
  });

  // ── Load settings from API on mount ──
  const loadSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/settings');
      if (!r.ok) return;
      const { settings } = await r.json();
      if (!settings) return;

      reset({
        clinicName:   settings.clinicName   || 'Mas Dent',
        clinicNameAr: settings.clinicNameAr || 'ماس دينت',
        phone:        settings.phone        || '',
        email:        settings.email        || '',
        address:      settings.address      || '',
        addressAr:    settings.addressAr    || '',
        workStart:    settings.workStart    || '09:00',
        workEnd:      settings.workEnd      || '18:00',
        breakStart:   settings.breakStart   || '13:00',
        breakEnd:     settings.breakEnd     || '14:00',
        whatsapp:     settings.whatsapp     || '',
        workDays:     settings.workDays     || ['Sunday','Monday','Tuesday','Wednesday','Thursday'],
      });

      if (Array.isArray(settings.workDays)) setWorkDays(settings.workDays);

      if (settings.notifications) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, enabled: settings.notifications[n.key] ?? n.enabled }))
        );
      }
    } catch {
      /* silent — use defaults */
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ── Save to API ──
  const handleTabSave = async (tab: 'clinic'|'appearance'|'schedule'|'notifications') => {
    let fieldsToValidate: any[] = [];
    let payload: any = {};
    
    if (tab === 'clinic') {
      fieldsToValidate = ['clinicName', 'clinicNameAr', 'phone', 'email', 'address', 'addressAr', 'whatsapp'];
    } else if (tab === 'schedule') {
      fieldsToValidate = ['workStart', 'workEnd', 'breakStart', 'breakEnd'];
    } else if (tab === 'notifications') {
      fieldsToValidate = []; // Notifications are in state
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) {
        console.error('Validation failed for fields', fieldsToValidate, errors);
        toast.error(isAr ? 'يرجى إصلاح أخطاء النموذج' : 'Please fix form errors');
        return;
      }
    }

    const values = getValues();
    
    if (tab === 'clinic') {
      payload = {
        clinicName: values.clinicName,
        clinicNameAr: values.clinicNameAr,
        phone: values.phone,
        email: values.email,
        address: values.address,
        addressAr: values.addressAr,
        whatsapp: values.whatsapp,
      };
    } else if (tab === 'schedule') {
      payload = {
        workStart: values.workStart,
        workEnd: values.workEnd,
        breakStart: values.breakStart,
        breakEnd: values.breakEnd,
        workDays: workDays,
      };
    } else if (tab === 'notifications') {
      payload = {
        notifications: notifications.reduce<Record<string, boolean>>((acc, n) => {
          acc[n.key] = n.enabled;
          return acc;
        }, {})
      };
    }

    setSaving(true);
    try {
      const r = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const j = await r.json();
        toast.error(j.error || (isAr ? 'فشل الحفظ' : 'Failed to save'));
        return;
      }
      toast.success(isAr ? 'تم حفظ الإعدادات بنجاح ✔' : 'Settings saved successfully!');
      router.refresh(); // Refresh the page to apply new settings to the layout
    } catch {
      toast.error(isAr ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) =>
    setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  const toggleNotif = (key: string) =>
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, enabled:!n.enabled } : n));

  if (loading) {
    return (
      <DashboardShell
        title={isAr ? 'إعدادات النظام' : 'System Settings'}
        subtitle={isAr ? 'إدارة معلومات العيادة وإعدادات النظام' : 'Manage clinic information and system configuration'}
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-72 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={isAr ? 'إعدادات النظام' : 'System Settings'}
      subtitle={isAr ? 'إدارة معلومات العيادة وإعدادات النظام' : 'Manage clinic information and system configuration'}
    >
      {/* Tab Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-1.5 mb-6 flex gap-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-teal-500/25'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}>
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {isAr ? tab.ar : tab.en}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Clinic Info ── */}
        {activeTab === 'clinic' && (
          <motion.div key="clinic" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleTabSave('clinic'); }} className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">business</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{isAr?'معلومات العيادة':'Clinic Information'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{isAr?'البيانات الأساسية لعيادتك':'Basic details about your clinic'}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name:'clinicName'   as const, label:isAr?'اسم العيادة (EN)':'Clinic Name (EN)', icon:'business', type:'text' },
                    { name:'clinicNameAr' as const, label:isAr?'اسم العيادة (AR)':'Clinic Name (AR)', icon:'business', type:'text' },
                    { name:'phone'        as const, label:isAr?'رقم الهاتف':'Phone Number',           icon:'call',     type:'tel' },
                    { name:'email'        as const, label:isAr?'البريد الإلكتروني':'Email',            icon:'mail',     type:'email' },
                    { name:'whatsapp'     as const, label:isAr?'واتساب (اختياري)':'WhatsApp',          icon:'chat',     type:'tel' },
                  ].map(f => (
                    <InputField key={f.name} label={f.label} icon={f.icon} isAr={isAr} error={errors[f.name]?.message}>
                      <Input type={f.type} {...register(f.name)}
                        className={`h-11 rounded-xl border-slate-200 bg-slate-50 ${errors[f.name]?'border-red-400':''}`} />
                    </InputField>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">location_on</span>
                  </div>
                  <h3 className="font-black text-slate-900">{isAr?'العنوان':'Address'}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-slate-500">{isAr?'العنوان (EN)':'Address (EN)'}</Label>
                    <textarea {...register('address')} rows={3} className={`flex w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none ${errors.address?'border-red-400':'border-slate-200'}`} />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <Label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-slate-500">{isAr?'العنوان (AR)':'Address (AR)'}</Label>
                    <textarea {...register('addressAr')} rows={3} dir="rtl" className={`flex w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none ${errors.addressAr?'border-red-400':'border-slate-200'}`} />
                    {errors.addressAr && <p className="text-red-500 text-xs mt-1">{errors.addressAr.message}</p>}
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">hub</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{isAr?'التكاملات':'Integrations'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{isAr?'ربط العيادة بخدمات خارجية':'Connect your clinic to external services'}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {INTEGRATIONS.map(int => (
                    <div key={int.name} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${int.status==='configure'?'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer':'border-slate-100 bg-slate-50/50 opacity-70'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${int.status==='configure'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-400'}`}>
                        <span className="material-symbols-outlined">{int.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800">{int.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{int.status==='configure'?(isAr?'انقر للإعداد':'Click to configure'):(isAr?'قريباً':'Coming soon')}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border shrink-0 ${int.badgeClass}`}>
                        {isAr ? int.ar : int.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {saving
                    ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{isAr?'جارٍ الحفظ...':'Saving...'}</>
                    : <><span className="material-symbols-outlined text-sm">save</span>{isAr?'حفظ معلومات العيادة':'Save Clinic Info'}</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}


        {/* ── Schedule ── */}
        {activeTab === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleTabSave('schedule'); }} className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">schedule</span>
                  </div>
                  <h3 className="font-black text-slate-900">{isAr?'ساعات العمل':'Working Hours'}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { name:'workStart' as const, label:isAr?'وقت البدء':'Start Time' },
                    { name:'workEnd'   as const, label:isAr?'وقت الانتهاء':'End Time' },
                  ].map(f => (
                    <div key={f.name}>
                      <Label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-slate-500">{f.label}</Label>
                      <Input type="time" {...register(f.name)} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-50 pt-5">
                  <p className="text-sm font-black text-slate-700 mb-3">{isAr?'أيام العمل':'Working Days'}</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_EN.map((day, i) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all border ${
                          workDays.includes(day)
                            ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white border-teal-600 shadow-md shadow-teal-500/25'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}>
                        {isAr ? DAYS_AR[i] : day.slice(0,3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">coffee</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{isAr?'وقت الاستراحة':'Break Time'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{isAr?'فترة راحة يومية اختيارية':'Optional daily rest period'}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name:'breakStart' as const, label:isAr?'بداية الاستراحة':'Break Start' },
                    { name:'breakEnd'   as const, label:isAr?'نهاية الاستراحة':'Break End' },
                  ].map(f => (
                    <div key={f.name}>
                      <Label className="block mb-1.5 text-xs font-black uppercase tracking-widest text-slate-500">{f.label}</Label>
                      <Input type="time" {...register(f.name)} className="h-11 rounded-xl border-slate-200 bg-slate-50" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600">beach_access</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{isAr?'الإجازات والعطل':'Holidays & Closures'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{isAr?'إدارة أيام الإغلاق الرسمية — قريباً.':'Manage official holidays and closure days — coming soon.'}</p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg border bg-amber-100 border-amber-300 text-amber-700 shrink-0">{isAr?'قريباً':'Soon'}</span>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {saving
                    ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{isAr?'جارٍ الحفظ...':'Saving...'}</>
                    : <><span className="material-symbols-outlined text-sm">save</span>{isAr?'حفظ ساعات العمل':'Save Schedule'}</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}>
            <form onSubmit={(e) => { e.preventDefault(); handleTabSave('notifications'); }} className="space-y-5">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white">notifications</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{isAr?'إعدادات الإشعارات':'Notification Settings'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{isAr?'تخصيص التنبيهات والرسائل التلقائية':'Customize alerts and automated messages'}</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((n, i) => (
                    <motion.div key={n.key} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${n.enabled?'bg-teal-50 text-teal-600':'bg-slate-100 text-slate-400'}`}>
                          <span className="material-symbols-outlined text-[18px]">notifications</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{isAr ? n.ar : n.en}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.enabled?(isAr?'مفعّل':'Active'):(isAr?'معطّل':'Inactive')}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => toggleNotif(n.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${n.enabled?'bg-teal-500':'bg-slate-200'}`}
                        aria-label={n.en}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${n.enabled?'left-7':'left-1'}`} />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50">
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-slate-400">info</span>
                    {isAr?'* تتطلب الإشعارات ربط خدمة واتساب أو بريد إلكتروني.':'* Notifications require WhatsApp or email service integration.'}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-8 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {saving
                    ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>{isAr?'جارٍ الحفظ...':'Saving...'}</>
                    : <><span className="material-symbols-outlined text-sm">save</span>{isAr?'حفظ الإشعارات':'Save Notifications'}</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}

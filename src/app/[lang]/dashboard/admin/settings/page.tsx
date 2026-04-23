"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

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

export default function AdminSettingsPage() {
  const params = useParams();
  const lang = (params.lang as string) || 'en';
  const isAr = lang === 'ar';
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'clinic'|'schedule'|'notifications'>('clinic');
  const [workDays, setWorkDays] = useState(['Sunday','Monday','Tuesday','Wednesday','Thursday']);
  const [notifications, setNotifications] = useState([
    { key: 'reminder_24h',  label: isAr ? 'تذكير الموعد (قبل 24 ساعة)' : 'Appointment reminder (24h before)', enabled: true },
    { key: 'new_appt',      label: isAr ? 'تأكيد الموعد الجديد' : 'New appointment confirmation', enabled: true },
    { key: 'cancellation',  label: isAr ? 'إشعار إلغاء الموعد' : 'Cancellation notification', enabled: false },
    { key: 'no_show',       label: isAr ? 'إشعار الغياب' : 'No-show alert', enabled: false },
  ]);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ClinicForm>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName:   'Mas Dent',
      clinicNameAr: 'ماس دينت',
      phone:        '',
      email:        '',
      address:      '',
      addressAr:    '',
      workStart:    '09:00',
      workEnd:      '18:00',
      workDays:     workDays,
      breakStart:   '13:00',
      breakEnd:     '14:00',
      whatsapp:     '',
    },
  });

  const onSave = async (data: ClinicForm) => {
    const tid = toast.loading(isAr ? 'جارٍ الحفظ...' : 'Saving settings...');
    console.log('Settings saved:', { ...data, workDays });
    await new Promise(r => setTimeout(r, 600)); // simulate async
    toast.success(isAr ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully!', { id: tid });
  };

  const toggleDay = (day: string) => {
    setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n));
  };

  const tabs = [
    { id: 'clinic',        icon: 'business',       label: isAr ? 'معلومات العيادة' : 'Clinic Info' },
    { id: 'schedule',      icon: 'schedule',        label: isAr ? 'ساعات العمل' : 'Schedule' },
    { id: 'notifications', icon: 'notifications',   label: isAr ? 'الإشعارات' : 'Notifications' },
  ] as const;

  const integrations = [
    { icon: 'chat',           name: 'WhatsApp Business API', status: 'configure', badge: isAr ? 'متاح' : 'Available', badgeVariant: 'default' as const },
    { icon: 'sms',            name: 'SMS Notifications',     status: 'soon',      badge: isAr ? 'قريباً' : 'Soon',      badgeVariant: 'secondary' as const },
    { icon: 'email',          name: 'Email Service',         status: 'soon',      badge: isAr ? 'قريباً' : 'Soon',      badgeVariant: 'secondary' as const },
    { icon: 'calendar_month', name: 'Google Calendar',       status: 'soon',      badge: isAr ? 'قريباً' : 'Soon',      badgeVariant: 'secondary' as const },
  ];

  return (
    <DashboardShell
      title={isAr ? 'إعدادات النظام' : 'System Settings'}
      subtitle={isAr ? 'إدارة معلومات العيادة وإعدادات النظام' : 'Manage clinic information and system configuration'}
    >
      {/* Premium Tab Bar */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1.5 mb-6 w-fit shadow-inner">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        {/* ── Clinic Info Tab ── */}
        {activeTab === 'clinic' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'معلومات العيادة' : 'Clinic Information'}</CardTitle>
                <CardDescription>{isAr ? 'البيانات الأساسية لعيادتك' : 'Basic details about your clinic'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { name: 'clinicName'   as const, label: isAr ? 'اسم العيادة (EN)' : 'Clinic Name (EN)' },
                    { name: 'clinicNameAr' as const, label: isAr ? 'اسم العيادة (AR)' : 'Clinic Name (AR)', dir: 'rtl' },
                    { name: 'phone'        as const, label: isAr ? 'رقم الهاتف' : 'Phone Number', type: 'tel' },
                    { name: 'email'        as const, label: isAr ? 'البريد الإلكتروني' : 'Email', type: 'email' },
                    { name: 'whatsapp'     as const, label: isAr ? 'واتساب (اختياري)' : 'WhatsApp (optional)', type: 'tel' },
                  ].map(f => (
                    <div key={f.name} className="space-y-1.5">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{f.label}</Label>
                      <Input
                        type={f.type ?? 'text'}
                        {...register(f.name)}
                        dir={f.dir}
                        className={errors[f.name] ? 'border-red-400 focus-visible:ring-red-500/20' : ''}
                      />
                      {errors[f.name] && <p className="text-red-500 text-xs">{String(errors[f.name]?.message)}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'العنوان' : 'Address'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'العنوان (EN)' : 'Address (EN)'}</Label>
                    <Textarea {...register('address')} rows={3} className="resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'العنوان (AR)' : 'Address (AR)'}</Label>
                    <Textarea {...register('addressAr')} rows={3} dir="rtl" className="resize-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'التكاملات' : 'Integrations'}</CardTitle>
                <CardDescription>{isAr ? 'ربط العيادة بخدمات خارجية' : 'Connect your clinic to external services'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {integrations.map(int => (
                    <div key={int.name}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        int.status === 'configure'
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                          : 'border-slate-200 bg-slate-50 opacity-70'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        int.status === 'configure' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className="material-symbols-outlined text-xl">{int.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800">{int.name}</p>
                        <p className="text-[11px] text-slate-500">{int.status === 'configure' ? (isAr ? 'انقر للإعداد' : 'Click to configure') : (isAr ? 'قريباً' : 'Coming soon')}</p>
                      </div>
                      <Badge variant={int.badgeVariant} className="text-[10px] shrink-0">{int.badge}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Schedule Tab ── */}
        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'ساعات العمل' : 'Working Hours'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'وقت البدء' : 'Start Time'}</Label>
                    <Input type="time" {...register('workStart')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'وقت الانتهاء' : 'End Time'}</Label>
                    <Input type="time" {...register('workEnd')} />
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">{isAr ? 'أيام العمل' : 'Working Days'}</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_EN.map((day, i) => (
                      <button
                        key={day} type="button" onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all border ${
                          workDays.includes(day)
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-primary/30'
                        }`}>
                        {isAr ? DAYS_AR[i] : day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'وقت الاستراحة' : 'Break Time'}</CardTitle>
                <CardDescription>{isAr ? 'فترة راحة يومية اختيارية' : 'Optional daily rest period'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'بداية الاستراحة' : 'Break Start'}</Label>
                    <Input type="time" {...register('breakStart')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">{isAr ? 'نهاية الاستراحة' : 'Break End'}</Label>
                    <Input type="time" {...register('breakEnd')} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-600">beach_access</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{isAr ? 'الإجازات والعطل' : 'Holidays & Closures'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'إدارة أيام الإغلاق الرسمية — قريباً.' : 'Manage official holidays and closure days — coming soon.'}</p>
                </div>
                <Badge variant="secondary" className="ms-auto text-[10px]">{isAr ? 'قريباً' : 'Soon'}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{isAr ? 'إعدادات الإشعارات' : 'Notification Settings'}</CardTitle>
                <CardDescription>{isAr ? 'تخصيص التنبيهات والرسائل التلقائية' : 'Customize alerts and automated messages'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {notifications.map((n, i) => (
                  <div key={n.key}>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{n.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {n.enabled ? (isAr ? 'مفعّل' : 'Active') : (isAr ? 'معطّل' : 'Inactive')}
                        </p>
                      </div>
                      {/* Premium Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleNotification(n.key)}
                        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 shrink-0 ${
                          n.enabled ? 'bg-primary' : 'bg-slate-200'
                        }`}
                        aria-label={`Toggle ${n.label}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          n.enabled ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    {i < notifications.length - 1 && <Separator />}
                  </div>
                ))}
                <p className="text-xs text-slate-400 pt-3">
                  {isAr ? '* تتطلب الإشعارات ربط خدمة واتساب أو بريد إلكتروني.' : '* Notifications require WhatsApp or email service integration.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex items-center gap-4">
          <Button type="submit" className="gap-2 px-8">
            <span className="material-symbols-outlined text-sm">save</span>
            {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}

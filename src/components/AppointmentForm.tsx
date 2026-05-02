"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { emitNewAppointment, type Appointment } from '@/lib/appointments';
import { useSettings } from '@/providers/SettingsProvider';

const schema = z.object({
  name: z.string().min(2, 'form.error.name'),
  email: z.string().email('form.error.email'),
  phone: z.string().min(7, 'form.error.phone'),
  date: z.string().min(1, 'form.error.date'),
  service: z.string().min(1, 'form.error.service'),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SERVICE_MAP: Record<string, string> = {
  '1': 'General Checkup & Cleaning',
  '2': 'Teeth Whitening',
  '3': 'Dental Implants',
  '4': 'Orthodontics (Braces / Invisalign)',
  '5': 'Other Concerns',
};

function FieldError({ msg }: { msg?: string }) {
  const { t } = useTranslation();
  if (!msg) return null;

  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 ltr:ml-2 rtl:mr-2"
    >
      <span className="material-symbols-outlined text-[13px]">error</span>{t(msg)}
    </motion.p>
  );
}

const AVAILABLE_TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
const generateDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 5) days.push(d); // Skip Friday
  }
  return days;
};

export default function AppointmentForm() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [step, setStep] = useState<'day' | 'time'>('day');
  const [tempDay, setTempDay] = useState<Date | null>(null);
  const [tempTime, setTempTime] = useState<string | null>(null);
  const upcomingDays = React.useMemo(() => generateDays(), []);

  const handleConfirmDateTime = () => {
    if (tempDay && tempTime) {
      const yyyy = tempDay.getFullYear();
      const mm = String(tempDay.getMonth() + 1).padStart(2, '0');
      const dd = String(tempDay.getDate()).padStart(2, '0');
      setValue('date', `${yyyy}-${mm}-${dd} ${tempTime}`, { shouldValidate: true });
      setIsDatePickerOpen(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service: SERVICE_MAP[data.service] ?? data.service }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error || t('form.error.submission')); return; }
      emitNewAppointment(json.appointment as Appointment);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setServerError(t('form.error.network'));
    }
  };

  const container: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const inputCls = (hasErr: boolean) =>
    `peer w-full bg-white/50 backdrop-blur-sm outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-6 pb-2 text-slate-900 relative z-10 font-medium transition-all duration-300 rounded-2xl border-2 hover:bg-white focus:bg-white shadow-sm ${hasErr
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
      : 'border-transparent focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 hover:border-slate-200'
    }`;

  return (
    <section className="py-24 px-4 relative overflow-hidden z-10" id="contact">
      {/* Abstract Backgrounds */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-teal-100/40 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-amber-100/30 to-transparent blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl shadow-teal-900/10 overflow-hidden flex flex-col lg:flex-row">

          {/* ── Left info panel ── */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="w-full lg:w-[42%] relative p-10 lg:p-16 text-white flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary-dark"
          >
            {/* Decors */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative z-10">
              <motion.span variants={itemVariant} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-8 text-teal-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {isRtl ? 'نحن هنا من أجلك' : 'We are here for you'}
              </motion.span>
              <motion.h3 variants={itemVariant} className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                {t('app.left.title')}
              </motion.h3>
              <motion.p variants={itemVariant} className="opacity-90 mb-12 text-lg font-light leading-relaxed max-w-sm text-teal-50">
                {t('app.left.desc')}
              </motion.p>
            </div>

            <div className="space-y-6 relative z-10 mt-auto">
              {[
                { href: `tel:${settings?.phone || '+15550001234'}`, icon: 'call', label: t('app.left.call'), val: settings?.phone || '+1 (555) 000-1234' },
                { href: `mailto:${settings?.email || 'care@masdent.com'}`, icon: 'mail', label: t('app.left.email'), val: settings?.email || 'care@masdent.com' },
              ].map(({ href, icon, label, val }) => (
                <motion.a
                  key={href}
                  href={href}
                  variants={itemVariant}
                  className="flex items-center gap-5 group cursor-pointer hover:bg-white/10 p-3 -ml-3 rounded-2xl transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg transition-all duration-400">
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-bold text-xl break-all">{val}</p>
                  </div>
                </motion.a>
              ))}

              <motion.a
                href="https://www.google.com/maps/search/?api=1&query=MasDent+Dental+Clinic"
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariant}
                className="flex items-start gap-5 pt-2 group cursor-pointer hover:bg-white/10 p-3 -ml-3 rounded-2xl transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 mt-1 group-hover:bg-white group-hover:text-primary group-hover:shadow-lg transition-all duration-400">
                  <span className="material-symbols-outlined text-[24px]">location_on</span>
                </div>
                <div>
                  <p className="text-xs text-teal-200 font-bold uppercase tracking-wider mb-1">{t('app.left.address')}</p>
                  <p className="font-medium text-base leading-relaxed opacity-90 break-words">
                    {(isRtl ? settings?.addressAr : settings?.address) || t('app.left.address.val').split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* ── Right form panel ── */}
          <div className="w-full lg:w-[58%] p-10 lg:p-16 relative bg-white/40">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 tracking-tight">
                {t('app.title').split(' ').map((w, i) => <span key={i} className={i === 1 ? 'text-gradient' : ''}>{w} </span>)}
              </h2>
              <p className="text-slate-500 font-medium">{t('app.subtitle')}</p>
            </motion.div>

            {/* Success toast */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="absolute top-8 left-8 right-8 z-30 flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xl shadow-emerald-900/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-white text-[20px]">check</span>
                  </div>
                  <div>
                    <p className="font-black text-emerald-900">Appointment Requested!</p>
                    <p className="text-sm font-semibold text-emerald-700">We'll confirm your visit shortly.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {serverError && (
              <div className="mb-8 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
                </div>
                <p className="text-red-700 font-bold">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">

              {/* Name */}
              <div className="relative group">
                <input {...register('name')} type="text" id="name" className={inputCls(!!errors.name)} placeholder=" " />
                <label htmlFor="name" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-20 font-bold pointer-events-none">{t('app.form.name')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 transition-colors pointer-events-none">person</span>
                <FieldError msg={errors.name?.message} />
              </div>

              {/* Email */}
              <div className="relative group">
                <input {...register('email')} type="email" id="email" className={inputCls(!!errors.email)} placeholder=" " />
                <label htmlFor="email" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-20 font-bold pointer-events-none">{t('app.form.email')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 transition-colors pointer-events-none">mail</span>
                <FieldError msg={errors.email?.message} />
              </div>

              {/* Phone */}
              <div className="relative group">
                <input {...register('phone')} type="tel" id="tel" className={inputCls(!!errors.phone)} placeholder=" " />
                <label htmlFor="tel" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-20 font-bold pointer-events-none">{t('app.form.phone')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 transition-colors pointer-events-none">phone_iphone</span>
                <FieldError msg={errors.phone?.message} />
              </div>

              {/* Date & Time Custom Modal */}
              <div className="relative group">
                <input
                  {...register('date')} type="text" id="date"
                  readOnly
                  onClick={() => { setIsDatePickerOpen(true); setStep('day'); setTempDay(null); setTempTime(null); }}
                  className={`${inputCls(!!errors.date)} cursor-pointer caret-transparent`}
                  placeholder=" "
                />
                <label htmlFor="date" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-20 font-bold pointer-events-none">{t('app.form.date')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 transition-colors pointer-events-none">event_upcoming</span>
                <FieldError msg={errors.date?.message} />

                {/* DatePicker Dropdown */}
                <AnimatePresence>
                  {isDatePickerOpen && (
                    <>
                      {/* Invisible backdrop for closing when clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col max-h-[400px]"
                      >
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(false)}
                          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors z-10"
                        >
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 shrink-0 pr-12 rtl:pr-0 rtl:pl-12">
                          <span className="material-symbols-outlined text-primary">event_upcoming</span>
                          {step === 'day' ? t('form.select_date') : t('form.select_time')}
                        </h3>

                        {step === 'day' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                            {upcomingDays.map((d, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => { setTempDay(d); setStep('time'); }}
                                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 hover:shadow-md ${tempDay?.toDateString() === d.toDateString() ? 'border-primary bg-teal-50 shadow-sm' : 'border-slate-100 hover:border-teal-200'}`}
                              >
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { weekday: 'short' })}</span>
                                <span className="text-2xl font-black text-slate-800">{d.getDate()}</span>
                                <span className="text-xs font-semibold text-slate-500">{d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short' })}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 pb-4 custom-scrollbar">
                            {AVAILABLE_TIMES.map((t, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setTempTime(t)}
                                className={`p-4 rounded-2xl border-2 transition-all text-center font-bold text-lg hover:shadow-md ${tempTime === t ? 'border-primary bg-teal-50 text-primary shadow-sm' : 'border-slate-100 text-slate-600 hover:border-teal-200'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3 shrink-0">
                          {step === 'time' && (
                            <button type="button" onClick={() => setStep('day')} className="w-14 h-14 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0">
                              <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { handleConfirmDateTime(); }}
                            disabled={step === 'day' || !tempTime}
                            className="flex-1 h-14 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-bold text-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-teal-900/20"
                          >
                            {t('form.confirm')}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Service */}
              <div className="relative group sm:col-span-2">
                <select {...register('service')} id="service" defaultValue="" className={`${inputCls(!!errors.service)} appearance-none cursor-pointer`}>
                  <option value="" disabled className="text-slate-400"></option>
                  {Object.entries(SERVICE_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <label htmlFor="service" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not([value=''])]:text-[10px] peer-[&:not([value=''])]:top-1.5 peer-[&:not([value=''])]:font-black z-20 font-bold pointer-events-none">{t('app.form.service')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 pointer-events-none">medical_services</span>
                <span className="material-symbols-outlined absolute ltr:right-4 rtl:left-4 top-[18px] text-slate-400 z-20 pointer-events-none">expand_more</span>
                <FieldError msg={errors.service?.message} />
              </div>

              {/* Notes */}
              <div className="relative group sm:col-span-2">
                <textarea {...register('notes')} id="notes" className={`${inputCls(false)} resize-none`} placeholder=" " rows={3} />
                <label htmlFor="notes" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-primary peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-20 font-bold pointer-events-none">{t('app.form.notes')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-primary z-20 transition-colors pointer-events-none">edit_note</span>
              </div>

              {/* Submit */}
              <div className="sm:col-span-2 mt-4">
                <button type="submit" disabled={isSubmitting}
                  className="w-full btn-primary h-14 font-black text-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none group"
                >
                  {isSubmitting
                    ? <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                    : <>
                      <span>{t('app.form.submit')}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform rtl:rotate-180">arrow_forward</span>
                    </>}
                </button>
                <p className="text-center text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-wider">{t('app.form.disclaimer')}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

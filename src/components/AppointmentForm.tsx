"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { emitNewAppointment, type Appointment } from '@/lib/appointments';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  service: z.string().min(1, 'Please select a service'),
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
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-xs mt-1.5 font-semibold flex items-center gap-1 ltr:ml-2 rtl:mr-2"
    >
      <span className="material-symbols-outlined text-[13px]">error</span>{msg}
    </motion.p>
  );
}

export default function AppointmentForm() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service: SERVICE_MAP[data.service] ?? data.service }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error || 'Submission failed'); return; }
      emitNewAppointment(json.appointment as Appointment);
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const inputCls = (hasErr: boolean) =>
    `peer w-full bg-white/50 backdrop-blur-sm outline-none ltr:pl-14 ltr:pr-5 rtl:pr-14 rtl:pl-5 pt-6 pb-2 text-slate-900 relative z-10 font-medium transition-all duration-300 rounded-2xl border-2 hover:bg-white focus:bg-white shadow-sm ${
      hasErr
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
            className="w-full lg:w-[42%] relative p-10 lg:p-16 text-white flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0a4f49] via-[#0d6b63] to-[#073d38]"
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
                { href: 'tel:+15550001234', icon: 'call', label: t('app.left.call'), val: '+1 (555) 000-1234' },
                { href: 'mailto:care@masdent.com', icon: 'mail', label: t('app.left.email'), val: 'care@masdent.com' },
              ].map(({ href, icon, label, val }) => (
                <motion.a
                  key={href}
                  href={href}
                  variants={itemVariant}
                  className="flex items-center gap-5 group cursor-pointer hover:bg-white/10 p-3 -ml-3 rounded-2xl transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#0a4f49] group-hover:shadow-lg transition-all duration-400">
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-teal-200 font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="font-bold text-xl">{val}</p>
                  </div>
                </motion.a>
              ))}
              
              <motion.div variants={itemVariant} className="flex items-start gap-5 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <span className="material-symbols-outlined text-[24px]">location_on</span>
                </div>
                <div>
                  <p className="text-xs text-teal-200 font-bold uppercase tracking-wider mb-1">{t('app.left.address')}</p>
                  <p className="font-medium text-base leading-relaxed opacity-90" dangerouslySetInnerHTML={{ __html: t('app.left.address.val') }} />
                </div>
              </motion.div>
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
                <label htmlFor="name" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-0 font-bold pointer-events-none">{t('app.form.name')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 transition-colors pointer-events-none">person</span>
                <FieldError msg={errors.name?.message} />
              </div>

              {/* Email */}
              <div className="relative group">
                <input {...register('email')} type="email" id="email" className={inputCls(!!errors.email)} placeholder=" " />
                <label htmlFor="email" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-0 font-bold pointer-events-none">{t('app.form.email')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 transition-colors pointer-events-none">mail</span>
                <FieldError msg={errors.email?.message} />
              </div>

              {/* Phone */}
              <div className="relative group">
                <input {...register('phone')} type="tel" id="tel" className={inputCls(!!errors.phone)} placeholder=" " />
                <label htmlFor="tel" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-0 font-bold pointer-events-none">{t('app.form.phone')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 transition-colors pointer-events-none">phone_iphone</span>
                <FieldError msg={errors.phone?.message} />
              </div>

              {/* Date */}
              <div className="relative group">
                <input
                  {...register('date')} type="text" id="date"
                  onFocus={(e) => { e.target.type = 'date'; try { (e.target as any).showPicker?.(); } catch { } }}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  className={`${inputCls(!!errors.date)} [color-scheme:light] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                  placeholder=" "
                />
                <label htmlFor="date" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-0 font-bold pointer-events-none">{t('app.form.date')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 transition-colors pointer-events-none">calendar_month</span>
                <FieldError msg={errors.date?.message} />
              </div>

              {/* Service */}
              <div className="relative group sm:col-span-2">
                <select {...register('service')} id="service" defaultValue="" className={`${inputCls(!!errors.service)} appearance-none cursor-pointer`}>
                  <option value="" disabled className="text-slate-400"></option>
                  {Object.entries(SERVICE_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <label htmlFor="service" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not([value=''])]:text-[10px] peer-[&:not([value=''])]:top-1.5 peer-[&:not([value=''])]:font-black z-0 font-bold pointer-events-none">{t('app.form.service')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 pointer-events-none">medical_services</span>
                <span className="material-symbols-outlined absolute ltr:right-4 rtl:left-4 top-[18px] text-slate-400 z-20 pointer-events-none">expand_more</span>
                <FieldError msg={errors.service?.message} />
              </div>

              {/* Notes */}
              <div className="relative group sm:col-span-2">
                <textarea {...register('notes')} id="notes" className={`${inputCls(false)} resize-none`} placeholder=" " rows={3} />
                <label htmlFor="notes" className="absolute ltr:left-14 rtl:right-14 top-4 text-slate-400 text-sm transition-all duration-300 peer-focus:text-[10px] peer-focus:text-[#0a4f49] peer-focus:top-1.5 peer-focus:font-black peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:font-black z-0 font-bold pointer-events-none">{t('app.form.notes')}</label>
                <span className="material-symbols-outlined absolute ltr:left-4 rtl:right-4 top-[18px] text-slate-300 group-focus-within:text-[#0a4f49] z-20 transition-colors pointer-events-none">edit_note</span>
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

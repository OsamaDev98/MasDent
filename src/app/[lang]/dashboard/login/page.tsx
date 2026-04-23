"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const { t } = useTranslation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isAr = lang === 'ar';

  const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });
  type LoginFormData = z.infer<typeof loginSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error || t('login.error')); return; }
      router.push(`/${lang}/dashboard`);
      router.refresh();
    } catch {
      setServerError(t('login.network'));
    }
  };

  return (
    <div className="min-h-screen flex" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── LEFT PANEL — Brand ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#0a4f4a] via-[#0d6e65] to-[#0f766e] flex-col">

        {/* Geometric background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-300/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl">dentistry</span>
            </div>
            <div>
              <p className="text-white font-black text-xl tracking-tight">{isAr ? 'ماس دينت' : 'Mas Dent'}</p>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">{isAr ? 'عيادة الأسنان' : 'Dental Clinic'}</p>
            </div>
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Large decorative icon */}
            <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl">
              <span className="material-symbols-outlined text-white text-5xl">health_and_safety</span>
            </div>

            <div>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                {isAr ? 'مرحباً بك في\nلوحة التحكم' : 'Welcome to\nYour Dashboard'}
              </h1>
              <p className="text-white/60 mt-4 text-lg leading-relaxed max-w-sm">
                {isAr
                  ? 'أدر مواعيدك، راقب أداء العيادة، وتواصل مع مرضاك من مكان واحد.'
                  : 'Manage appointments, track clinic performance, and connect with patients — all in one place.'}
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {(isAr
                ? ['📅 إدارة المواعيد', '👥 سجلات المرضى', '📊 تقارير وتحليلات', '💳 المدفوعات']
                : ['📅 Appointments', '👥 Patient Records', '📊 Analytics', '💳 Payments']
              ).map((f, i) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold backdrop-blur-sm"
                >
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Footer quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/30 text-xs font-medium"
          >
            {isAr ? '© 2026 ماس دينت — نصنع الابتسامات' : '© 2026 Mas Dent — Crafting Smiles'}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50/60 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0d6e65] to-[#0f766e] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-xl">dentistry</span>
            </div>
            <div>
              <p className="font-black text-slate-900">{isAr ? 'ماس دينت' : 'Mas Dent'}</p>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{isAr ? 'لوحة التحكم' : 'Dashboard'}</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </h2>
            <p className="text-slate-500 mt-1.5">
              {isAr ? 'أدخل بياناتك للوصول إلى لوحة التحكم' : 'Enter your credentials to access the dashboard'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8 space-y-5">

            {/* Error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-bold text-slate-700">
                  {t('login.username')}
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none`}>
                    person
                  </span>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder={isAr ? 'اسم المستخدم' : 'admin'}
                    {...register('username')}
                    className={`w-full h-12 ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${errors.username ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none`}>
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full h-12 ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all outline-none focus:bg-white focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer`}
                  >
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0d6e65] to-[#0f766e] hover:from-[#0a5c54] hover:to-[#0d6e65] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-700/25 hover:shadow-teal-700/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span>{t('login.submit')}</span>
                    <span className={`material-symbols-outlined text-lg ${isAr ? 'rotate-180' : ''}`}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-slate-400 text-xs mt-6 px-4"
          >
            {t('login.footer')}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

interface User { name: string; role: 'admin' | 'staff'; username: string; }

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      <div className="hidden lg:block w-64 shrink-0" style={{ background: 'linear-gradient(180deg, #062e2a 0%, #0a3f3a 35%, #0c4e48 100%)' }} />
      <div className="flex-1 flex flex-col">
        <div className="h-[60px] bg-white border-b border-slate-100 animate-pulse" />
        <div className="h-[72px] bg-white border-b border-slate-100 animate-pulse mt-px" />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children, title, subtitle, actions }: DashboardShellProps) {
  const router   = useRouter();
  const params   = useParams();
  const pathname = usePathname();
  const lang     = (params.lang as string) || 'en';
  const isAr     = lang === 'ar';
  const { t }    = useTranslation();

  const [user, setUser]               = useState<User | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me');
      if (!r.ok) { router.replace(`/${lang}/dashboard/login`); return; }
      setUser((await r.json()).user);
    } catch {
      router.replace(`/${lang}/dashboard/login`);
    }
  }, [router, lang]);

  const fetchPending = useCallback(async () => {
    try {
      const r = await fetch('/api/appointments?status=pending');
      if (r.ok) setPendingCount((await r.json()).appointments?.length ?? 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchPending();
  }, [fetchUser, fetchPending]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace(`/${lang}/dashboard/login`);
  };

  // Build breadcrumbs from pathname (skip lang segment)
  const crumbs = pathname.split('/').filter(Boolean).slice(1);

  if (!user) return <ShellSkeleton />;

  return (
    <div className="flex min-h-screen bg-[#f4f6f9]" dir={isAr ? 'rtl' : 'ltr'}>
      <DashboardSidebar
        role={user.role}
        userName={user.name}
        onLogout={logout}
        pendingCount={pendingCount}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-3 px-5 h-[60px]">

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            {/* Breadcrumb */}
            <nav className="hidden lg:flex items-center gap-1.5 text-sm flex-1">
              {crumbs.map((crumb, i) => (
                <React.Fragment key={crumb}>
                  {i > 0 && (
                    <span className={`material-symbols-outlined text-slate-300 text-sm ${isAr ? 'rotate-180' : ''}`}>
                      chevron_right
                    </span>
                  )}
                  <span className={`font-semibold capitalize ${
                    i === crumbs.length - 1 ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600 cursor-pointer'
                  }`}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Mobile title */}
            <p className="lg:hidden font-black text-slate-900 text-sm flex-1 truncate">{title}</p>

            <div className="flex-1 lg:flex-none" />

            {/* Right side actions */}
            <div className="flex items-center gap-2">

              {/* View Website */}
              <a
                href={`/${lang}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
                title={isAr ? 'زيارة الموقع' : 'View Website'}
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span className="hidden md:inline">{isAr ? 'زيارة الموقع' : 'View Website'}</span>
              </a>

              {/* Language switcher */}
              <a
                href={`/${lang === 'ar' ? 'en' : 'ar'}/dashboard`}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
              >
                <span className="material-symbols-outlined text-sm">language</span>
                {lang === 'ar' ? 'EN' : 'عر'}
              </a>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); }}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors relative"
                >
                  <span className="material-symbols-outlined text-xl">notifications</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full text-[9px] font-black text-amber-950 flex items-center justify-center ring-2 ring-white">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`absolute ${isAr ? 'left-0' : 'right-0'} top-12 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-4 z-50`}
                  >
                    <p className="font-black text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">notifications</span>
                      {isAr ? 'الإشعارات' : 'Notifications'}
                    </p>
                    {pendingCount > 0 ? (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-amber-600 text-[18px]">schedule</span>
                        </div>
                        <p className="text-sm text-amber-800 font-semibold">
                          {isAr
                            ? `لديك ${pendingCount} مواعيد قيد الانتظار`
                            : `${pendingCount} pending appointment${pendingCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <span className="material-symbols-outlined text-4xl text-slate-200 block mb-2">notifications_off</span>
                        <p className="text-slate-400 text-sm">{isAr ? 'لا توجد إشعارات' : 'No new notifications'}</p>
                      </div>
                    )}
                  </motion.div>
                )}
                {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}
              </div>

              {/* User Menu */}
              <div className={`relative flex items-center gap-2.5 ${isAr ? 'pr-2.5 border-r' : 'pl-2.5 border-l'} border-slate-100`}>
                <button
                  onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); }}
                  className="flex items-center gap-2.5 cursor-pointer outline-none group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-teal-900/20 ring-2 ring-white">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm hidden sm:block group-hover:text-slate-600 transition-colors">
                    expand_more
                  </span>
                </button>

                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`absolute ${isAr ? 'left-0' : 'right-0'} top-12 w-60 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden z-50`}
                  >
                    {/* Profile header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-base shadow-md shadow-teal-900/20">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.username}</p>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {isAr ? (user.role === 'admin' ? 'مدير' : 'موظف') : user.role}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors text-start"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">logout</span>
                        </div>
                        {isAr ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </motion.div>
                )}
                {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Header ── */}
        <div className="bg-white border-b border-slate-100 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-black text-slate-900 tracking-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p
                  key={subtitle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-sm mt-0.5 font-medium"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 shrink-0"
              >
                {actions}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Page Content ── */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

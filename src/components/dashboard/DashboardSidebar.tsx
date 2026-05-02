"use client";
import React from 'react';
import { useParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/providers/SettingsProvider';

interface NavItem {
  icon: string;
  labelEn: string;
  labelAr: string;
  href: string;
  badge?: number;
}

interface DashboardSidebarProps {
  role: 'admin' | 'staff';
  userName: string;
  onLogout: () => void;
  pendingCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const staffNav: NavItem[] = [
  { icon: 'dashboard',      labelEn: 'Overview',     labelAr: 'الرئيسية',       href: 'staff' },
  { icon: 'calendar_month', labelEn: 'Appointments', labelAr: 'المواعيد',       href: 'staff/appointments' },
  { icon: 'group',          labelEn: 'Patients',     labelAr: 'المرضى',         href: 'staff/patients' },
  { icon: 'queue',          labelEn: 'Queue',        labelAr: 'قائمة الانتظار', href: 'staff/queue' },
  { icon: 'payments',       labelEn: 'Payments',     labelAr: 'المدفوعات',      href: 'staff/payments' },
];

const adminNav: NavItem[] = [
  { icon: 'analytics',         labelEn: 'Analytics',    labelAr: 'التحليلات', href: 'admin' },
  { icon: 'calendar_month',    labelEn: 'Appointments', labelAr: 'المواعيد',  href: 'admin/appointments' },
  { icon: 'group',             labelEn: 'Patients',     labelAr: 'المرضى',    href: 'admin/patients' },
  { icon: 'medical_services',  labelEn: 'Services',     labelAr: 'الخدمات',   href: 'admin/services' },
  { icon: 'badge',             labelEn: 'Staff',        labelAr: 'الموظفون',  href: 'admin/staff' },
  { icon: 'payments',          labelEn: 'Finance',      labelAr: 'المالية',   href: 'admin/finance' },
  { icon: 'settings',          labelEn: 'Settings',     labelAr: 'الإعدادات', href: 'admin/settings' },
];

const LABELS: Record<string, { en: string; ar: string }> = {
  main:   { en: 'Main',   ar: 'الرئيسية' },
  manage: { en: 'Manage', ar: 'الإدارة'  },
  system: { en: 'System', ar: 'النظام'   },
};

const staffSections = [
  { key: 'main',   items: staffNav.slice(0, 1) },
  { key: 'manage', items: staffNav.slice(1) },
];
const adminSections = [
  { key: 'main',   items: adminNav.slice(0, 1) },
  { key: 'manage', items: adminNav.slice(1, 5) },
  { key: 'system', items: adminNav.slice(5) },
];

export default function DashboardSidebar({
  role, userName, onLogout, pendingCount = 0, mobileOpen, onMobileClose,
}: DashboardSidebarProps) {
  const params   = useParams();
  const lang     = (params.lang as string) || 'en';
  const isAr     = lang === 'ar';
  const pathname = usePathname();
  const { settings } = useSettings();

  const sections = role === 'admin' ? adminSections : staffSections;

  const isActive = (href: string) => {
    const segs     = pathname.split('/').filter(Boolean);
    const hrefSegs = href.split('/').filter(Boolean);
    if (hrefSegs.length === 1) return segs[segs.length - 1] === hrefSegs[0];
    return pathname.includes(hrefSegs[hrefSegs.length - 1]);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/30 shrink-0">
            <span className="material-symbols-outlined text-white text-xl">dentistry</span>
            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/10" />
          </div>
          <div className="leading-none">
            <p className="font-black text-white text-[15px] tracking-tight">
              {isAr ? settings?.clinicNameAr || 'ماس دينت' : settings?.clinicName || 'Mas Dent'}
            </p>
            <p className="text-white/35 text-[9px] font-bold uppercase tracking-widest mt-0.5">
              {role === 'admin' ? (isAr ? 'لوحة الإدارة' : 'Admin Panel') : (isAr ? 'لوحة الموظف' : 'Staff Portal')}
            </p>
          </div>
        </div>

        {/* Role pill */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/6 border border-white/8">
          <div className="w-6 h-6 rounded-lg bg-teal-400/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-teal-300 text-[13px]">
              {role === 'admin' ? 'admin_panel_settings' : 'badge'}
            </span>
          </div>
          <span className="text-white/60 text-[11px] font-semibold">
            {role === 'admin' ? (isAr ? 'صلاحية: مدير' : 'Role: Admin') : (isAr ? 'صلاحية: موظف' : 'Role: Staff')}
          </span>
          <div className="ms-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-white/6 mb-2 shrink-0" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 pb-3 overflow-y-auto space-y-4 scrollbar-none">
        {sections.map((section) => (
          <div key={section.key}>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 mb-1.5">
              {isAr ? LABELS[section.key].ar : LABELS[section.key].en}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active   = isActive(item.href);
                const href     = `/${lang}/dashboard/${item.href}`;
                const label    = isAr ? item.labelAr : item.labelEn;
                const hasBadge = item.icon === 'calendar_month' && pendingCount > 0;

                return (
                  <a
                    key={item.href}
                    href={href}
                    onClick={onMobileClose}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      active
                        ? 'bg-white/12 text-white shadow-sm'
                        : 'text-white/45 hover:bg-white/7 hover:text-white/85'
                    }`}
                  >
                    {/* Active pill */}
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className={`absolute ${isAr ? 'right-0' : 'left-0'} inset-y-2 w-[3px] rounded-full bg-teal-400`}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      active ? 'bg-teal-400/15' : 'bg-transparent group-hover:bg-white/6'
                    }`}>
                      <span className={`material-symbols-outlined text-[18px] transition-colors ${
                        active ? 'text-teal-300' : 'text-white/40 group-hover:text-white/75'
                      }`}>
                        {item.icon}
                      </span>
                    </div>

                    <span className="flex-1 truncate">{label}</span>

                    {/* Badge */}
                    <AnimatePresence>
                      {hasBadge && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="shrink-0 min-w-[20px] h-5 px-1.5 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full flex items-center justify-center"
                        >
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Logout Button ── */}
      <div className="mx-4 h-px bg-white/6 shrink-0" />
      <div className="p-3 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-red-500/10 transition-colors shrink-0">
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </div>
          <span className="text-sm font-semibold">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen sticky top-0"
        style={{ background: 'linear-gradient(180deg, #062e2a 0%, #0a3f3a 35%, #0c4e48 100%)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: isAr ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`relative ${isAr ? 'ml-auto' : ''} w-72 flex flex-col`}
              style={{ background: 'linear-gradient(180deg, #062e2a 0%, #0a3f3a 35%, #0c4e48 100%)' }}
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

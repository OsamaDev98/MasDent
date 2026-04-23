"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * /[lang]/dashboard — middleware handles role-based redirect to /admin or /staff.
 * This client component is a fallback in case middleware redirect didn't fire.
 */
export default function DashboardIndexPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params.lang as string) || 'en';

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(j => {
        if (j.user?.role === 'admin') router.replace(`/${lang}/dashboard/admin`);
        else router.replace(`/${lang}/dashboard/staff`);
      })
      .catch(() => router.replace(`/${lang}/dashboard/login`));
  }, [router, lang]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <span className="material-symbols-outlined text-primary-dark text-5xl animate-spin">progress_activity</span>
    </div>
  );
}

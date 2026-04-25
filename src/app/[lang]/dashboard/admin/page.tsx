/**
 * Admin Analytics Page — React Server Component
 * ─────────────────────────────────────────────
 * Runs on the server:
 *  1. Verifies the auth cookie (redundant safety check; middleware is primary guard)
 *  2. Queries MongoDB directly via the DAL (no HTTP round-trip to /api/analytics)
 *  3. Passes plain data as props to the client view component
 *
 * Benefits:
 *  - Zero loading-skeleton flash — data arrives with the first HTML
 *  - No client-side fetch or useEffect
 *  - Refresh via router.refresh() re-runs this function server-side
 */
import { redirect } from 'next/navigation';
import { getAnalyticsData, getCurrentUser } from '@/lib/dal';
import AdminAnalyticsView from '@/components/dashboard/AdminAnalyticsView';

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function AdminAnalyticsPage({ params }: Props) {
  const { lang } = await params;

  // Secondary auth check — middleware already redirects unauthenticated users,
  // but this ensures admins can't somehow access via direct navigation
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect(`/${lang}/dashboard/login`);
  }

  // Direct DB query — no HTTP round-trip
  const data = await getAnalyticsData();

  return <AdminAnalyticsView data={data} lang={lang} />;
}

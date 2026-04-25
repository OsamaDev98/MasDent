/**
 * Staff Overview Page — React Server Component
 * ─────────────────────────────────────────────
 * Runs on the server:
 *  1. Verifies the auth cookie
 *  2. Queries MongoDB directly via the DAL (no HTTP round-trip to /api/appointments)
 *  3. Passes serialised appointment data to the client view component
 *
 * Benefits:
 *  - No loading skeleton flash — data arrives with the first HTML
 *  - No client-side fetch or useEffect
 *  - Refresh via router.refresh() re-runs this function server-side
 */
import { redirect } from 'next/navigation';
import { getStaffOverviewData, getCurrentUser } from '@/lib/dal';
import StaffOverviewView from '@/components/dashboard/StaffOverviewView';

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function StaffOverviewPage({ params }: Props) {
  const { lang } = await params;

  // Secondary auth check
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${lang}/dashboard/login`);
  }

  // Direct DB query — no HTTP round-trip to /api/appointments
  const data = await getStaffOverviewData();

  return <StaffOverviewView data={data} lang={lang} />;
}

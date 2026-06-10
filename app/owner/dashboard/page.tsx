import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layouts/navbar';
import { Footer } from '@/components/layouts/footer';
import { OwnerDashboardClient } from './dashboard-client';

export const metadata = {
  title: 'Owner Dashboard | KILUVA',
  description: 'Manage your properties and bookings on KILUVA',
};

export default function OwnerDashboardPage() {
  // TODO: Check authentication and owner status
  // Redirect to login if not authenticated
  // const session = await getSession();
  // if (!session) redirect('/login');

  return (
    <main className="w-full">
      <Navbar />
      <OwnerDashboardClient />
      <Footer />
    </main>
  );
}

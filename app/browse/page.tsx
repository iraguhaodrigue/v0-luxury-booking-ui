import { Navbar } from '@/components/layouts/navbar';
import { Footer } from '@/components/layouts/footer';
import { BrowsePageClient } from './browse-client';

export const metadata = {
  title: 'Browse Properties | KILUVA',
  description: 'Browse luxury properties, featured collections, and special offers on KILUVA',
};

export default function BrowsePage() {
  return (
    <main className="w-full">
      <Navbar />
      <BrowsePageClient />
      <Footer />
    </main>
  );
}

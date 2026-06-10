import { Navbar } from '@/components/layouts/navbar';
import { Footer } from '@/components/layouts/footer';
import { SearchPageClient } from './search-client';

export const metadata = {
  title: 'Search Properties | KILUVA',
  description: 'Search luxury properties, villas, apartments, and hotels worldwide on KILUVA',
};

export default function SearchPage() {
  return (
    <main className="w-full">
      <Navbar />
      <SearchPageClient />
      <Footer />
    </main>
  );
}

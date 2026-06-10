import Link from 'next/link';
import { Navbar } from '@/components/layouts/navbar';
import { Footer } from '@/components/layouts/footer';
import { OwnerPropertiesClient } from './properties-client';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'My Properties | KILUVA Owner',
  description: 'Manage all your properties on KILUVA',
};

export default function OwnerPropertiesPage() {
  return (
    <main className="w-full">
      <Navbar />
      
      {/* Header */}
      <section className="bg-secondary border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              My Properties
            </h1>
            <p className="text-muted-foreground mt-1">Manage and edit your listings</p>
          </div>
          <Link href="/owner/properties/new">
            <Button>Add New Property</Button>
          </Link>
        </div>
      </section>

      <OwnerPropertiesClient />
      <Footer />
    </main>
  );
}

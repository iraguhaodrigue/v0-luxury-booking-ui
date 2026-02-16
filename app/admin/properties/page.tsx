import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import PropertiesContent from '@/components/admin/properties-content'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Manage Properties | Admin',
  description: 'Manage all luxury properties',
}

export default function PropertiesPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                  Manage Properties
                </h1>
                <p className="text-muted-foreground">
                  View and manage all properties
                </p>
              </div>
              <button className="btn-luxury-accent flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Property</span>
              </button>
            </div>

            {/* Content */}
            <PropertiesContent />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

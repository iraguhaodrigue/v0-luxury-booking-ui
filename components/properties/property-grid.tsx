import { PropertyCard } from './property-card'
import { FilterSidebar } from './filter-sidebar'
import { createClient } from '@/lib/supabase/server'

export async function PropertyGrid() {
  const supabase = await createClient()
  
  // Fetch all properties from database
  const { data: properties = [] } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  
  const handleFiltersChange = (filters: any) => {
    // This will be handled client-side in FilterSidebar
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar onFiltersChange={handleFiltersChange} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Available Properties
            </h2>
            <p className="text-muted-foreground">
              Found {filteredProperties.length} properties
            </p>
          </div>

          {/* Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  name={property.name}
                  location={property.location}
                  price={property.base_price_per_night}
                  image={property.image_url}
                  rating={property.star_rating || 5}
                  reviews={0}
                  capacity={property.total_rooms || 1}
                  amenities={property.amenities || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No properties found. Add properties from the admin panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

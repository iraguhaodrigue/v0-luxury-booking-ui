'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingCard } from '@/components/customer/booking-card';
import { WishlistCard } from '@/components/customer/wishlist-card';
import { Loader2, Calendar, Heart, Settings } from 'lucide-react';
import type { Booking, Property } from '@/lib/types/marketplace';

export function CustomerDashboardClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlistProperties, setWishlistProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  // Load bookings and wishlist
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);

        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('kiluva_wishlist');
        if (savedWishlist) {
          try {
            const wishlistIds = JSON.parse(savedWishlist);
            // TODO: Fetch property details for wishlisted items
            console.log('[v0] Wishlist IDs:', wishlistIds);
          } catch (error) {
            console.error('[v0] Error loading wishlist:', error);
          }
        }

        // TODO: Fetch customer bookings
        // const customerBookings = await getCustomerBookings(userId);
        // setBookings(customerBookings);

        console.log('[v0] Customer dashboard data loading placeholder');
      } catch (error) {
        console.error('[v0] Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, []);

  const handleRemoveFromWishlist = (propertyId: number) => {
    const saved = localStorage.getItem('kiluva_wishlist');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const updated = list.filter((id: number) => id !== propertyId);
        localStorage.setItem('kiluva_wishlist', JSON.stringify(updated));
        setWishlistProperties((prev) =>
          prev.filter((p) => p.id !== propertyId)
        );
      } catch (error) {
        console.error('[v0] Error updating wishlist:', error);
      }
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.check_in_date || '') > new Date()
  );

  const completedBookings = bookings.filter(
    (b) => b.status === 'completed'
  );

  return (
    <div className="w-full bg-background">
      {/* Header Section */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                My Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your bookings and saved properties
              </p>
            </div>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Bookings ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Saved ({wishlistProperties.length})
                </TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                {bookings.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No bookings yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start planning your next getaway
                    </p>
                    <Link href="/search">
                      <Button>Browse Properties</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming Bookings */}
                    {upcomingBookings.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Upcoming Trips</h2>
                        {upcomingBookings.map((booking) => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            onMessage={(id) =>
                              console.log('[v0] Message booking:', id)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Completed Bookings */}
                    {completedBookings.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Past Trips</h2>
                        {completedBookings.map((booking) => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            onMessage={(id) =>
                              console.log('[v0] Message booking:', id)
                            }
                            onReview={(propertyId) =>
                              console.log('[v0] Review property:', propertyId)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Other Bookings */}
                    {upcomingBookings.length === 0 &&
                      completedBookings.length === 0 && (
                        <div className="space-y-4">
                          {bookings.map((booking) => (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              onMessage={(id) =>
                                console.log('[v0] Message booking:', id)
                              }
                            />
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                {wishlistProperties.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No saved properties
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Save properties to your wishlist for easy access later
                    </p>
                    <Link href="/browse">
                      <Button>Browse Properties</Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {wishlistProperties.map((property) => (
                      <WishlistCard
                        key={property.id}
                        property={property}
                        onRemove={handleRemoveFromWishlist}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-secondary border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/search">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-foreground mb-2">
                  Find Properties
                </h3>
                <p className="text-sm text-muted-foreground">
                  Search with advanced filters
                </p>
              </Card>
            </Link>

            <Link href="/browse">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-foreground mb-2">
                  Browse All
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore our collection
                </p>
              </Card>
            </Link>

            <Link href="/dashboard/settings">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-foreground mb-2">
                  Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

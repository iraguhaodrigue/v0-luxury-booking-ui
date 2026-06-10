'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/owner/stats-card';
import { OwnerPropertyList } from '@/components/owner/property-list';
import { OwnerBookingList } from '@/components/owner/booking-list';
import {
  Home,
  Calendar,
  DollarSign,
  Star,
  Plus,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react';
import type { Property, Booking } from '@/lib/types/marketplace';

export function OwnerDashboardClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Load owner data
  useEffect(() => {
    const loadOwnerData = async () => {
      try {
        setLoading(true);
        // TODO: Fetch owner properties and bookings
        // const ownerProperties = await getOwnerProperties(ownerId);
        // const ownerBookings = await getOwnerBookings(ownerId);
        // setProperties(ownerProperties);
        // setBookings(ownerBookings);
        console.log('[v0] Owner dashboard data loading placeholder');
      } catch (error) {
        console.error('[v0] Error loading owner data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOwnerData();
  }, []);

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      // TODO: Call delete API
      // await deleteProperty(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch (error) {
      console.error('[v0] Error deleting property:', error);
    }
  };

  const handleEditProperty = (propertyId: number) => {
    // Navigate to edit page
    window.location.href = `/owner/properties/${propertyId}/edit`;
  };

  const stats = [
    {
      label: 'Total Properties',
      value: properties.length,
      icon: Home,
      trend: { value: 12, isPositive: true },
    },
    {
      label: 'Active Bookings',
      value: bookings.filter((b) => b.status === 'confirmed').length,
      icon: Calendar,
      trend: { value: 8, isPositive: true },
    },
    {
      label: 'Total Revenue',
      value: `$${bookings.reduce((sum, b) => sum + (b.total_price || 0), 0).toFixed(0)}`,
      icon: DollarSign,
      trend: { value: 23, isPositive: true },
    },
    {
      label: 'Average Rating',
      value: '4.8',
      icon: Star,
      subtext: 'Based on guest reviews',
    },
  ];

  return (
    <div className="w-full bg-background">
      {/* Header Section */}
      <section className="bg-secondary border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                Welcome back, Owner
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your properties, bookings, and earnings
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/owner/properties/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Property
                </Button>
              </Link>
              <Link href="/owner/settings">
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <StatsCard
                key={idx}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                subtext={stat.subtext}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Tabs Section */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="properties">
                  Properties ({properties.length})
                </TabsTrigger>
                <TabsTrigger value="bookings">
                  Bookings ({bookings.length})
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Bookings */}
                  <Card className="lg:col-span-1">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Recent Bookings</h3>
                    </div>
                    <div className="p-6">
                      {bookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No bookings yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {bookings.slice(0, 5).map((booking) => (
                            <div
                              key={booking.id}
                              className="p-3 bg-secondary rounded-lg flex items-center justify-between"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {booking.guest?.full_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {booking.property?.name}
                                </p>
                              </div>
                              <p className="font-semibold">
                                ${booking.total_price?.toFixed(0)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="lg:col-span-1">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Quick Actions</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <Link href="/owner/properties/new" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Property
                        </Button>
                      </Link>
                      <Link href="/owner/properties" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Home className="w-4 h-4 mr-2" />
                          Manage Properties
                        </Button>
                      </Link>
                      <Link href="/owner/bookings" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          View All Bookings
                        </Button>
                      </Link>
                      <Link href="/owner/settings" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Properties Tab */}
              <TabsContent value="properties" className="space-y-4">
                <OwnerPropertyList
                  properties={properties}
                  onDelete={handleDeleteProperty}
                  onEdit={handleEditProperty}
                />
                {properties.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No properties yet. Create your first property to get started.
                    </p>
                    <Link href="/owner/properties/new">
                      <Button>Create Property</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-4">
                <OwnerBookingList
                  bookings={bookings}
                  onViewDetails={(id) =>
                    console.log('[v0] View booking details:', id)
                  }
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
}

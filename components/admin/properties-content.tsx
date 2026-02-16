'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/data-table'
import { createClient } from '@/lib/supabase/client'

interface PropertyData {
  id: number
  name: string
  location: string
  city: string
  property_type: string
  total_rooms: number
  base_price_per_night: number
  is_active: boolean
}

const columns = [
  { key: 'id', label: 'Property ID' },
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
  { key: 'city', label: 'City' },
  { key: 'property_type', label: 'Type' },
  { key: 'total_rooms', label: 'Rooms' },
  {
    key: 'base_price_per_night',
    label: 'Price/Night',
    render: (value: number) => `$${value}`,
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (value: boolean) => (
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value
            ? 'bg-accent/10 text-accent'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]

export default function PropertiesContent() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setProperties(data || [])
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleEdit = (property: any) => {
    console.log('Edit property:', property)
  }

  const handleDelete = async (property: any) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)

      if (error) throw error
      setProperties(properties.filter(p => p.id !== property.id))
    } catch (err) {
      console.error('Error deleting property:', err)
    }
  }

  const handleView = (property: any) => {
    console.log('View property:', property)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={properties}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  )
}

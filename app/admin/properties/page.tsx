'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/supabase/storage'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from 'lucide-react'

interface Property {
  id: number
  owner_id: number
  name: string
  property_type: 'villa' | 'apartment'
  location: string
  description: string | null
  city: string | null
  country: string | null
  total_rooms: number | null
  amenities: string[] | null
  base_price_per_night: number
  currency: string
  images: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const PROPERTY_TYPES = ['villa', 'apartment']
const emptyForm = { name: '', property_type: 'villa', location: '', description: '', city: '', country: '', total_rooms: '0', amenities: '', base_price_per_night: '', currency: 'USD' }

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState<Property | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => {
    setEditing(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setError(''); setDialogOpen(true)
  }

  const openEdit = (item: Property) => {
    setEditing(item)
    setForm({ 
      name: item.name, 
      property_type: item.property_type, 
      location: item.location, 
      description: item.description || '', 
      city: item.city || '', 
      country: item.country || '', 
      total_rooms: String(item.total_rooms || 0), 
      amenities: Array.isArray(item.amenities) ? item.amenities.join(', ') : item.amenities || '', 
      base_price_per_night: String(item.base_price_per_night || 0), 
      currency: item.currency || 'USD' 
    })
    setImageFile(null); 
    setImagePreview(item.images && item.images.length > 0 ? item.images[0] : null); 
    setError(''); 
    setDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }
  }

  const handleSave = async () => {
    if (!form.name || !form.location || !form.base_price_per_night) { setError('Name, location, and price are required'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    let images = editing?.images || []
    if (imageFile) { 
      const url = await uploadImage(imageFile, 'properties')
      if (url) images = [url]
    }
    const amenitiesArray = form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(a => a) : []
    const payload = { 
      name: form.name, 
      property_type: form.property_type, 
      location: form.location, 
      description: form.description || null, 
      city: form.city || null,
      country: form.country || null,
      total_rooms: parseInt(form.total_rooms) || 0, 
      amenities: amenitiesArray, 
      base_price_per_night: parseFloat(form.base_price_per_night),
      currency: form.currency,
      images: images,
      is_active: true
    }

    const { error: dbError } = editing
      ? await supabase.from('properties').update(payload).eq('id', editing.id)
      : await supabase.from('properties').insert(payload)

    if (dbError) { setError(dbError.message); setSaving(false); return }
    setSaving(false); setDialogOpen(false); fetchItems()
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('properties').delete().eq('id', deleting.id)
    setSaving(false); setDeleteOpen(false); setDeleting(null); fetchItems()
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Properties</h1>
              <p className="text-muted-foreground mt-1">Manage your luxury properties</p>
            </div>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Property</Button>
          </div>

          <Card>
            <CardHeader><CardTitle>All Properties ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : items.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No properties yet. Click &quot;Add Property&quot; to create one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
                        <TableHead>Location</TableHead><TableHead>Price/Night</TableHead><TableHead>Rooms</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.images && item.images.length > 0 && item.images[0] ? (
                              <img src={item.images[0]} alt={item.name} className="h-12 w-16 object-cover rounded" onError={(e) => {
                                console.log("[v0] Image failed to load:", item.images[0])
                                e.currentTarget.style.display = 'none'
                              }} />
                            ) : (
                              <div className="h-12 w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{item.property_type}</Badge></TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>{new Intl.NumberFormat('en-RW', { style: 'currency', currency: item.currency, maximumFractionDigits: 0 }).format(item.base_price_per_night)}</TableCell>
                          <TableCell>{item.total_rooms || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="destructive" size="sm" onClick={() => { setDeleting(item); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Property' : 'Add Property'}</DialogTitle><DialogDescription>{editing ? 'Update property details below' : 'Create a new property listing'}</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                <div><Label>Property Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Luxury Villa Kigali" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Type *</Label>
                    <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v as 'villa' | 'apartment' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div><Label>Currency</Label>
                    <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="RWF">RWF</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <div><Label>Location *</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Kigali, Rwanda" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="e.g. Kigali" /></div>
                  <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="e.g. Rwanda" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Base Price per Night *</Label><Input type="number" value={form.base_price_per_night} onChange={e => setForm({ ...form, base_price_per_night: e.target.value })} placeholder="250000" /></div>
                  <div><Label>Total Rooms</Label><Input type="number" value={form.total_rooms} onChange={e => setForm({ ...form, total_rooms: e.target.value })} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the property..." /></div>
                <div><Label>Amenities</Label><Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="Pool, Spa, WiFi, Restaurant..." /></div>
                <div><Label>Image</Label><Input type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !form.name || !form.location || !form.base_price_per_night}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Delete Property</DialogTitle><DialogDescription>This action cannot be undone</DialogDescription></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

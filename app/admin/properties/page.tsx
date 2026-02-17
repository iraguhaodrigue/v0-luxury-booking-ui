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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash2, ImageIcon, Loader2, Star } from 'lucide-react'

interface Property {
  id: number
  name: string
  property_type: string
  location: string
  description: string | null
  star_rating: number | null
  total_rooms: number | null
  amenities: string | null
  image_url: string | null
}

interface Amenity {
  id: number
  name: string
  description?: string
}

const PROPERTY_TYPES = ['villa', 'hotel', 'lodge', 'resort', 'apartment']
const emptyForm = { 
  name: '', 
  property_type: 'villa', 
  location: '', 
  description: '', 
  star_rating: '5', 
  total_rooms: '10', 
  selected_amenities: [] as number[],
  image_url: '' 
}

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
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
  const supabase = createClient()

  const fetchAmenities = useCallback(async () => {
    const { data } = await supabase.from('amenities').select('*').order('name')
    if (data) setAmenities(data)
  }, [supabase])

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { 
    fetchAmenities()
    fetchItems() 
  }, [fetchAmenities, fetchItems])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (item: Property) => {
    setEditing(item)
    setForm({ name: item.name, property_type: item.property_type, location: item.location, description: item.description || '', star_rating: String(item.star_rating || 5), total_rooms: String(item.total_rooms || 10), selected_amenities: [], image_url: item.image_url || '' })
    setImageFile(null); setImagePreview(item.image_url || null); setError(''); setDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { 
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file)) 
    }
  }

  const toggleAmenity = (id: number) => {
    setForm(prev => ({
      ...prev,
      selected_amenities: prev.selected_amenities.includes(id)
        ? prev.selected_amenities.filter(a => a !== id)
        : [...prev.selected_amenities, id]
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.location) { 
      setError('Name and location are required')
      return 
    }
    
    setSaving(true)
    setError('')
    
    try {
      let imageUrl = form.image_url
      if (imageFile) { 
        const url = await uploadImage(imageFile, 'properties')
        if (url) imageUrl = url 
      }

      const amenitiesText = form.selected_amenities.length > 0
        ? amenities.filter(a => form.selected_amenities.includes(a.id)).map(a => a.name).join(', ')
        : null

      const payload = { 
        name: form.name, 
        property_type: form.property_type, 
        location: form.location, 
        description: form.description || null, 
        star_rating: parseInt(form.star_rating) || 5, 
        total_rooms: parseInt(form.total_rooms) || 0, 
        amenities: amenitiesText, 
        image_url: imageUrl || null 
      }

      const { error: dbError } = editing
        ? await supabase.from('properties').update(payload).eq('id', editing.id)
        : await supabase.from('properties').insert([payload])

      if (dbError) { 
        setError(dbError.message)
        console.error('DB Error:', dbError)
        return 
      }

      setSaving(false)
      setDialogOpen(false)
      fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      const { error: dbError } = await supabase.from('properties').delete().eq('id', deleting.id)
      if (dbError) {
        setError(dbError.message)
        console.error('Delete error:', dbError)
        return
      }
      setDeleteOpen(false)
      setDeleting(null)
      fetchItems()
    } finally {
      setSaving(false)
    }
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
                        <TableHead>Location</TableHead><TableHead>Rating</TableHead><TableHead>Rooms</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.image_url ? <img src={item.image_url} alt={item.name} className="h-12 w-16 object-cover rounded" />
                              : <div className="h-12 w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
                          </TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{item.property_type}</Badge></TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{item.star_rating}</div></TableCell>
                          <TableCell>{item.total_rooms}</TableCell>
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Property' : 'Add Property'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="grid gap-4 py-4">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                
                <div>
                  <Label>Property Name *</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    placeholder="e.g. Luxury Villa Kigali"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.property_type} onValueChange={v => setForm({ ...form, property_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Star Rating</Label>
                    <Select value={form.star_rating} onValueChange={v => setForm({ ...form, star_rating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map(n => (
                          <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Location *</Label>
                  <Input 
                    value={form.location} 
                    onChange={e => setForm({ ...form, location: e.target.value })} 
                    placeholder="e.g. Kigali, Rwanda"
                    required
                  />
                </div>

                <div>
                  <Label>Total Rooms</Label>
                  <Input 
                    type="number" 
                    value={form.total_rooms} 
                    onChange={e => setForm({ ...form, total_rooms: e.target.value })} 
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    rows={3} 
                    placeholder="Describe the property..."
                  />
                </div>

                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/20">
                    {amenities.length === 0 ? (
                      <p className="col-span-2 text-sm text-muted-foreground">No amenities available. Run the migration SQL first.</p>
                    ) : (
                      amenities.map(amenity => (
                        <div key={amenity.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={`amenity-${amenity.id}`}
                            checked={form.selected_amenities.includes(amenity.id)}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                          />
                          <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer text-sm">{amenity.name}</Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label>Image</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving || !form.name || !form.location}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Delete Property</DialogTitle></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
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

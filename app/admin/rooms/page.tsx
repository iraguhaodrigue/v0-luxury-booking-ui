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
import { Plus, Pencil, Trash2, ImageIcon, Loader2, Check, X } from 'lucide-react'

interface Room {
  id: number; property_id: number; name: string; description: string | null; room_type: string
  price_per_night: number; max_guests: number; is_available: boolean; amenities: string | null
  image_url: string | null; properties?: { name: string }
}
interface Property { id: number; name: string }

const emptyForm = { property_id: '', name: '', description: '', room_type: '', price_per_night: '', max_guests: '2', is_available: 'true', amenities: '' }

export default function RoomsPage() {
  const [items, setItems] = useState<Room[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)
  const [deleting, setDeleting] = useState<Room | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    const supabase = createClient()
    const [{ data: rooms }, { data: props }] = await Promise.all([
      supabase.from('rooms').select('*, properties(name)').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, name').order('name')
    ])
    if (rooms) setItems(rooms)
    if (props) setProperties(props)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setError(''); setDialogOpen(true) }

  const openEdit = (item: Room) => {
    setEditing(item)
    setForm({ property_id: String(item.property_id), name: item.name, description: item.description || '', room_type: item.room_type || '', price_per_night: String(item.price_per_night), max_guests: String(item.max_guests), is_available: String(item.is_available), amenities: item.amenities || '' })
    setImageFile(null); setImagePreview(item.image_url || null); setError(''); setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.property_id || !form.price_per_night) { setError('Name, property, and price are required'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    let imageUrl = editing?.image_url || null
    if (imageFile) { const url = await uploadImage(imageFile, 'rooms'); if (url) imageUrl = url }
    const payload = { property_id: parseInt(form.property_id), name: form.name, description: form.description || null, room_type: form.room_type || null, price_per_night: parseFloat(form.price_per_night), max_guests: parseInt(form.max_guests) || 2, is_available: form.is_available === 'true', amenities: form.amenities || null, image_url: imageUrl }

    const { error: dbError } = editing
      ? await supabase.from('rooms').update(payload).eq('id', editing.id)
      : await supabase.from('rooms').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    setSaving(false); setDialogOpen(false); fetchItems()
  }

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true)
    await createClient().from('rooms').delete().eq('id', deleting.id)
    setSaving(false); setDeleteOpen(false); setDeleting(null); fetchItems()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-3xl font-serif font-bold text-foreground">Rooms</h1><p className="text-muted-foreground mt-1">Manage rooms across all properties</p></div>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>All Rooms ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : items.length === 0 ? <p className="text-center py-12 text-muted-foreground">No rooms yet. Add a property first, then add rooms.</p>
              : <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                  <TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Property</TableHead><TableHead>Type</TableHead><TableHead>Price/Night</TableHead><TableHead>Guests</TableHead><TableHead>Available</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader><TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.image_url ? <img src={item.image_url} alt={item.name} className="h-12 w-16 object-cover rounded" /> : <div className="h-12 w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.properties?.name || '-'}</TableCell>
                      <TableCell><Badge variant="secondary">{item.room_type || '-'}</Badge></TableCell>
                      <TableCell>{fmt(item.price_per_night)}</TableCell>
                      <TableCell>{item.max_guests}</TableCell>
                      <TableCell>{item.is_available ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-destructive" />}</TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => { setDeleting(item); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table></div>}
            </CardContent>
          </Card>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                <div><Label>Property *</Label><Select value={form.property_id} onValueChange={v => setForm({ ...form, property_id: v })}><SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger><SelectContent>{properties.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Room Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Deluxe Suite" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Room Type</Label><Input value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })} placeholder="e.g. Suite, Standard" /></div>
                  <div><Label>Max Guests</Label><Input type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price per Night (RWF) *</Label><Input type="number" value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} placeholder="250000" /></div>
                  <div><Label>Available</Label><Select value={form.is_available} onValueChange={v => setForm({ ...form, is_available: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div><Label>Amenities</Label><Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="King bed, Balcony, Mini bar..." /></div>
                <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />}</div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving || !form.name || !form.property_id || !form.price_per_night}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent><DialogHeader><DialogTitle>Delete Room</DialogTitle></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

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

interface Service {
  id: number; name: string; description: string | null; price_per_day: number
  service_type: string; category: string | null; is_active: boolean; image_url: string | null
}

const emptyForm = { name: '', description: '', price: '', service_type: 'spa', category: '', is_active: 'true' }

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    const { data } = await createClient().from('services').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setError(''); setDialogOpen(true) }
  const openEdit = (item: Service) => {
    setEditing(item)
    setForm({ name: item.name, description: item.description || '', price: String(item.price_per_day), service_type: item.service_type, category: item.category || '', is_active: String(item.is_active) })
    setImageFile(null); setImagePreview(item.image_url || null); setError(''); setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('Name and price are required'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    let imageUrl = editing?.image_url || null
    if (imageFile) { const url = await uploadImage(imageFile, 'services'); if (url) imageUrl = url }
    const payload = { name: form.name, description: form.description || null, price_per_day: parseFloat(form.price), service_type: form.service_type, category: form.category || null, is_active: form.is_active === 'true', image_url: imageUrl }
    const { error: dbError } = editing
      ? await supabase.from('services').update(payload).eq('id', editing.id)
      : await supabase.from('services').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    setSaving(false); setDialogOpen(false); fetchItems()
  }

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true)
    await createClient().from('services').delete().eq('id', deleting.id)
    setSaving(false); setDeleteOpen(false); setDeleting(null); fetchItems()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="text-3xl font-serif font-bold text-foreground">Services</h1><p className="text-muted-foreground mt-1">Manage available services</p></div>
            <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
          </div>
          <Card>
            <CardHeader><CardTitle>All Services ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : items.length === 0 ? <p className="text-center py-12 text-muted-foreground">No services yet. Click &quot;Add Service&quot; to create one.</p>
              : <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                  <TableHead>Image</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader><TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.image_url ? <img src={item.image_url} alt={item.name} className="h-12 w-16 object-cover rounded" /> : <div className="h-12 w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell><Badge variant="secondary">{item.category || 'General'}</Badge></TableCell>
                      <TableCell>{fmt(item.price_per_day)}</TableCell>
                      <TableCell>{item.is_active ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-destructive" />}</TableCell>
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
              <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                <div><Label>Service Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Airport Transfer" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price (RWF) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="50000" /></div>
                  <div><Label>Service Type</Label><Select value={form.service_type} onValueChange={v => setForm({ ...form, service_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="spa">Spa</SelectItem><SelectItem value="dining">Dining</SelectItem><SelectItem value="tour">Tour</SelectItem><SelectItem value="transport">Transport</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Wellness, Food & Beverage" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the service..." /></div>
                <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />}</div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving || !form.name || !form.price}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent><DialogHeader><DialogTitle>Delete Service</DialogTitle></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

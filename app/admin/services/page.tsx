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
import { Plus, Pencil, Trash2, ImageIcon, Loader2, Check, X } from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string | null
  price_per_day: number
  service_type: string | null
  is_active: boolean
  image_url: string | null
}

const emptyForm = { name: '', description: '', price_per_day: '', service_type: '', is_active: 'true' }

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
    setForm({ name: item.name, description: item.description || '', price_per_day: String(item.price_per_day), service_type: item.service_type || '', is_active: String(item.is_active) })
    setImageFile(null); setImagePreview(item.image_url || null); setError(''); setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price_per_day) { setError('Name and price are required'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    let imageUrl = editing?.image_url || null
    if (imageFile) { const url = await uploadImage(imageFile, 'services'); if (url) imageUrl = url }
    const payload = { name: form.name, description: form.description || null, price_per_day: parseFloat(form.price_per_day), service_type: form.service_type || null, is_active: form.is_active === 'true', image_url: imageUrl }
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
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div><h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Services</h1><p className="text-muted-foreground mt-1 text-sm">Manage available services</p></div>
            <Button onClick={openAdd} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg sm:text-xl">All Services ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : items.length === 0 ? <p className="text-center py-12 text-muted-foreground text-sm">No services yet. Click &quot;Add Service&quot; to create one.</p>
              : <div className="overflow-x-auto -mx-6 sm:mx-0"><Table><TableHeader><TableRow>
                  <TableHead className="text-xs sm:text-sm">Image</TableHead><TableHead className="text-xs sm:text-sm">Name</TableHead><TableHead className="text-xs sm:text-sm">Type</TableHead><TableHead className="text-xs sm:text-sm">Price</TableHead><TableHead className="text-xs sm:text-sm">Active</TableHead><TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow></TableHeader><TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2 sm:py-4">{item.image_url ? <img src={item.image_url} alt={item.name} className="h-10 sm:h-12 w-12 sm:w-16 object-cover rounded" /> : <div className="h-10 sm:h-12 w-12 sm:w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" /></div>}</TableCell>
                      <TableCell className="font-medium text-sm">{item.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{item.service_type || 'General'}</Badge></TableCell>
                      <TableCell className="text-sm">{fmt(item.price_per_day)}</TableCell>
                      <TableCell>{item.is_active ? <Check className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" /> : <X className="h-4 sm:h-5 w-4 sm:w-5 text-destructive" />}</TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-1 sm:gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}><Pencil className="h-3 sm:h-4 w-3 sm:w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => { setDeleting(item); setDeleteOpen(true) }}><Trash2 className="h-3 sm:h-4 w-3 sm:w-4" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table></div>}
            </CardContent>
          </Card>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle><DialogDescription>{editing ? 'Update the service details below' : 'Create a new service by filling out the form below'}</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                <div><Label>Service Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Airport Transfer" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Service Type</Label><Input value={form.service_type} onChange={e => setForm({ ...form, service_type: e.target.value })} placeholder="e.g. Transport, Spa" /></div>
                  <div><Label>Price (RWF) *</Label><Input type="number" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} placeholder="50000" /></div>
                </div>
                <div><Label>Active</Label><Select value={form.is_active} onValueChange={v => setForm({ ...form, is_active: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the service..." /></div>
                <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />}</div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving || !form.name || !form.price_per_day}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent><DialogHeader><DialogTitle>Delete Service</DialogTitle><DialogDescription>This action cannot be undone</DialogDescription></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

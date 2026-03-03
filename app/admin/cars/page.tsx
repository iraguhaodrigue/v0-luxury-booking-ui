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
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from 'lucide-react'

interface Car {
  id: number
  make: string
  model: string
  year: number
  license_plate: string
  price_per_day: number
  status: string
  features: string | null
  seats: number
  transmission: string
  fuel_type: string
  image_url: string | null
}

const CAR_STATUSES = ['available', 'booked', 'maintenance', 'retired']
const TRANSMISSIONS = ['automatic', 'manual']
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid']
const emptyForm = { make: '', model: '', year: String(new Date().getFullYear()), license_plate: '', price_per_day: '', status: 'available', features: '', seats: '5', transmission: 'automatic', fuel_type: 'petrol' }

export default function CarsPage() {
  const [items, setItems] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Car | null>(null)
  const [deleting, setDeleting] = useState<Car | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchItems = useCallback(async () => {
    const { data } = await createClient().from('cars').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setError(''); setDialogOpen(true) }
  const openEdit = (item: Car) => {
    setEditing(item)
    setForm({ make: item.make, model: item.model, year: String(item.year), license_plate: item.license_plate, price_per_day: String(item.price_per_day), status: item.status, features: item.features || '', seats: String(item.seats), transmission: item.transmission || 'automatic', fuel_type: item.fuel_type || 'petrol' })
    setImageFile(null); setImagePreview(item.image_url || null); setError(''); setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.make || !form.model || !form.price_per_day || !form.license_plate) { setError('Make, model, license plate, and daily rate are required'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    let imageUrl = editing?.image_url || null
    if (imageFile) { const url = await uploadImage(imageFile, 'cars'); if (url) imageUrl = url }
    const payload = { make: form.make, model: form.model, year: parseInt(form.year), license_plate: form.license_plate, price_per_day: parseFloat(form.price_per_day), status: form.status, features: form.features || null, seats: parseInt(form.seats) || 5, transmission: form.transmission, fuel_type: form.fuel_type, image_url: imageUrl }
    const { error: dbError } = editing
      ? await supabase.from('cars').update(payload).eq('id', editing.id)
      : await supabase.from('cars').insert(payload)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    setSaving(false); setDialogOpen(false); fetchItems()
  }

  const handleDelete = async () => {
    if (!deleting) return; setSaving(true)
    await createClient().from('cars').delete().eq('id', deleting.id)
    setSaving(false); setDeleteOpen(false); setDeleting(null); fetchItems()
  }

  const fmt = (n: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(n)
  const statusColor = (s: string) => s === 'available' ? 'bg-emerald-100 text-emerald-800' : s === 'booked' ? 'bg-blue-100 text-blue-800' : s === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div><h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Cars</h1><p className="text-muted-foreground mt-1 text-sm">Manage your vehicle fleet</p></div>
            <Button onClick={openAdd} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Car</Button>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-lg sm:text-xl">All Cars ({items.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              : items.length === 0 ? <p className="text-center py-12 text-muted-foreground text-sm">No cars yet. Click &quot;Add Car&quot; to add one.</p>
              : <div className="overflow-x-auto -mx-6 sm:mx-0"><Table><TableHeader><TableRow>
                  <TableHead className="text-xs sm:text-sm">Image</TableHead><TableHead className="text-xs sm:text-sm">Make / Model</TableHead><TableHead className="text-xs sm:text-sm">Year</TableHead><TableHead className="text-xs sm:text-sm">Plate</TableHead><TableHead className="text-xs sm:text-sm">Rate/Day</TableHead><TableHead className="text-xs sm:text-sm">Seats</TableHead><TableHead className="text-xs sm:text-sm">Status</TableHead><TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow></TableHeader><TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="py-2 sm:py-4">{item.image_url ? <img src={item.image_url} alt={`${item.make} ${item.model}`} className="h-10 sm:h-12 w-12 sm:w-16 object-cover rounded" /> : <div className="h-10 sm:h-12 w-12 sm:w-16 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" /></div>}</TableCell>
                      <TableCell className="font-medium text-sm">{item.make} {item.model}</TableCell>
                      <TableCell className="text-sm">{item.year}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{item.license_plate}</Badge></TableCell>
                      <TableCell className="text-sm">{fmt(item.price_per_day)}</TableCell>
                      <TableCell className="text-sm">{item.seats}</TableCell>
                      <TableCell><span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColor(item.status)}`}>{item.status}</span></TableCell>
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
              <DialogHeader><DialogTitle>{editing ? 'Edit Car' : 'Add Car'}</DialogTitle><DialogDescription>{editing ? 'Update the vehicle details below' : 'Add a new vehicle to your fleet'}</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Make *</Label><Input value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} placeholder="e.g. Toyota" /></div>
                  <div><Label>Model *</Label><Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. Land Cruiser" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></div>
                  <div><Label>License Plate *</Label><Input value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value })} placeholder="RAD 123A" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Daily Rate (RWF) *</Label><Input type="number" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} placeholder="150000" /></div>
                  <div><Label>Seats</Label><Input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CAR_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Transmission</Label><Select value={form.transmission} onValueChange={v => setForm({ ...form, transmission: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Fuel Type</Label><Select value={form.fuel_type} onValueChange={v => setForm({ ...form, fuel_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FUEL_TYPES.map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div><Label>Features</Label><Textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={2} placeholder="AC, GPS, Leather seats..." /></div>
                <div><Label>Image</Label><Input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-full object-cover rounded border" />}</div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving || !form.make || !form.model || !form.price_per_day || !form.license_plate}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : editing ? 'Update' : 'Create'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent><DialogHeader><DialogTitle>Delete Car</DialogTitle><DialogDescription>This action cannot be undone</DialogDescription></DialogHeader>
              <p className="text-muted-foreground">Are you sure you want to delete <strong>{deleting?.make} {deleting?.model}</strong>?</p>
              <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete'}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

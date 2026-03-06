'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Loader2, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'

interface Booking {
  id: string
  item_id: string
  item_type: string
  item_name: string | null
  user_name: string
  user_email: string
  user_phone: string | null
  guests: number
  checkin: string
  checkout: string
  total_price: number
  payment_method: string | null
  extras: Array<{ id: number; name: string; price: number }> | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  admin_comment: string | null
  confirmed_at: string | null
  created_at: string
}

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
} as const

const countNights = (checkin: string, checkout: string) =>
  Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86_400_000))

export default function BookingsContent() {
  const [bookings,    setBookings]   = useState<Booking[]>([])
  const [loading,     setLoading]    = useState(true)
  const [filter,      setFilter]     = useState<string>('all')
  const [selected,    setSelected]   = useState<Booking | null>(null)
  const [comment,     setComment]    = useState('')
  const [saving,      setSaving]     = useState(false)
  const [dialogOpen,  setDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadBookings()
    const channel = supabase
      .channel('bookings_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadBookings())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setBookings((data ?? []) as Booking[])
    setLoading(false)
  }

  const openDetail = (b: Booking) => {
    setSelected(b)
    setComment(b.admin_comment ?? '')
    setDialogOpen(true)
  }

  const updateStatus = async (status: Booking['status']) => {
    if (!selected) return
    setSaving(true)
    const patch: Record<string, unknown> = {
      status,
      admin_comment: comment.trim() || null,
      ...(status === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
    }
    const { data, error } = await supabase
      .from('bookings')
      .update(patch)
      .eq('id', selected.id)
      .select()
      .single()

    if (!error && data) {
      const updated = data as Booking
      setSelected(updated)
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
      setDialogOpen(false)
    }
    setSaving(false)
  }

  const saveNote = async () => {
    if (!selected) return
    setSaving(true)
    await supabase.from('bookings').update({ admin_comment: comment.trim() || null }).eq('id', selected.id)
    setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, admin_comment: comment.trim() || null } : b))
    setSaving(false)
    setDialogOpen(false)
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts   = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl border p-4 text-left transition-all ${
              filter === s ? 'border-accent bg-accent/10' : 'border-border bg-secondary hover:border-accent/40'
            }`}
          >
            <p className="text-2xl font-bold text-foreground">
              {s === 'all' ? bookings.length : (counts[s] ?? 0)}
            </p>
            <p className="text-xs font-medium text-muted-foreground capitalize mt-1">{s}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No bookings found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {['Guest', 'Item', 'Dates', 'Total', 'Payment', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(b => {
                const cfg = STATUS_CONFIG[b.status]
                return (
                  <tr key={b.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{b.user_name}</p>
                      <p className="text-xs text-muted-foreground">{b.user_email}</p>
                      {b.user_phone && <p className="text-xs text-muted-foreground">{b.user_phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{b.item_name ?? b.item_id}</p>
                      <p className="text-xs text-muted-foreground capitalize">{b.item_type}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-foreground">{b.checkin}</p>
                      <p className="text-muted-foreground">→ {b.checkout}</p>
                      <p className="text-xs text-muted-foreground">{countNights(b.checkin, b.checkout)} nights</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(b.total_price)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b.payment_method ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => openDetail(b)}>Manage</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Booking Detail</DialogTitle>
            <DialogDescription>Review and update this reservation.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-1 max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selected.status].className}`}>
                  {STATUS_CONFIG[selected.status].label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(selected.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Guest */}
              <div className="rounded-xl bg-secondary p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guest</p>
                {[
                  { l: 'Name',   v: selected.user_name },
                  { l: 'Email',  v: selected.user_email },
                  { l: 'Phone',  v: selected.user_phone ?? '—' },
                  { l: 'Guests', v: String(selected.guests) },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>

              {/* Stay */}
              <div className="rounded-xl bg-secondary p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stay</p>
                {[
                  { l: 'Item',       v: selected.item_name ?? selected.item_id },
                  { l: 'Type',       v: selected.item_type },
                  { l: 'Check-in',   v: selected.checkin },
                  { l: 'Check-out',  v: selected.checkout },
                  { l: 'Nights',     v: String(countNights(selected.checkin, selected.checkout)) },
                  { l: 'Payment',    v: selected.payment_method ?? '—' },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-semibold text-foreground capitalize">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-accent">{formatPrice(selected.total_price)}</span>
                </div>
              </div>

              {/* Extras */}
              {selected.extras && selected.extras.length > 0 && (
                <div className="rounded-xl bg-secondary p-4 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Extras</p>
                  <ul className="space-y-1">
                    {selected.extras.map((e, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="text-foreground">{e.name}</span>
                        <span className="text-muted-foreground">{formatPrice(e.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Admin note */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MessageSquare className="inline w-4 h-4 mr-1 text-accent" />
                  Admin Note
                </label>
                <Textarea
                  placeholder="Optional note for this booking…"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 min-w-[80px]">
              Close
            </Button>
            {selected?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateStatus('cancelled')}
                  disabled={saving}
                  className="flex-1 min-w-[80px] border-red-200 text-red-700 hover:bg-red-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                </Button>
                <Button
                  onClick={() => updateStatus('confirmed')}
                  disabled={saving}
                  className="flex-1 min-w-[80px] bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-1" />Confirm</>}
                </Button>
              </>
            )}
            {selected?.status === 'confirmed' && (
              <>
                <Button onClick={saveNote} disabled={saving} variant="outline" className="flex-1 min-w-[80px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note'}
                </Button>
                <Button onClick={() => updateStatus('completed')} disabled={saving} className="flex-1 min-w-[80px]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Completed'}
                </Button>
              </>
            )}
            {(selected?.status === 'cancelled' || selected?.status === 'completed') && (
              <Button onClick={saveNote} disabled={saving} className="flex-1 min-w-[80px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

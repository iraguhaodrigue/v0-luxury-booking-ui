'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Shield, User } from 'lucide-react'

interface UserWithRole {
  id: string
  email: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState<string>('customer')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      const userIds = authUsers.map(u => u.id)
      
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds)

      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) ?? [])

      const combined: UserWithRole[] = authUsers.map(user => ({
        id: user.id,
        email: user.email || 'No email',
        role: rolesMap.get(user.id) || 'customer',
        created_at: user.created_at || new Date().toISOString()
      }))

      setUsers(combined)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (user: UserWithRole) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setDialogOpen(true)
  }

  const saveRole = async () => {
    if (!selectedUser) return
    
    try {
      setSaving(true)
      const supabase = createClient()

      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert({ user_id: selectedUser.id, role: newRole }, { onConflict: 'user_id' })

      if (upsertError) throw upsertError

      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u))
      setDialogOpen(false)
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="w-full min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-2">Manage user roles and permissions</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No users found</p>
                ) : (
                  <div className="overflow-x-auto -mx-6 sm:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs sm:text-sm">Email</TableHead>
                          <TableHead className="text-xs sm:text-sm">Role</TableHead>
                          <TableHead className="text-xs sm:text-sm">Joined</TableHead>
                          <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(user => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium text-sm">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                {user.role === 'admin' ? <><Shield className="mr-1 h-3 w-3" /> Admin</> : <><User className="mr-1 h-3 w-3" /> Customer</>}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" onClick={() => handleRoleChange(user)} className="text-xs">
                                Change Role
                              </Button>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change User Role</DialogTitle>
                  <DialogDescription>Update the role for {selectedUser?.email}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={saveRole} disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </main>
  )
}

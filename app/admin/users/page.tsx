'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layouts/navbar'
import { AdminSidebar } from '@/components/layouts/admin-sidebar'
import { Footer } from '@/components/layouts/footer'
import { DataTable } from '@/components/admin/data-table'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  role: 'client' | 'admin'
  is_active: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<'client' | 'admin'>('client')
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Query profiles which are linked to auth.users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Add email from session/auth if available
      const formattedUsers = data?.map(user => ({
        id: user.id,
        email: user.email || 'N/A',
        full_name: user.full_name || 'No Name',
        role: user.role || 'client',
        is_active: user.is_active !== false,
        created_at: user.created_at
      })) || []

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (user: User, newRole: 'client' | 'admin') => {
    try {
      const supabase = createClient()
      
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update auth user metadata
      const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { role: newRole }
      })

      if (authError) throw authError

      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()
      
      // Delete profile (cascade deletes auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      setUsers(users.filter(u => u.id !== user.id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)

      if (error) throw error

      setUsers(users.map(u => 
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ))
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'full_name', label: 'Name' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent capitalize">
          {value}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <main className="w-full min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AdminSidebar />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Manage Users
              </h1>
              <p className="text-muted-foreground">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-4 mb-8 flex-wrap">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-luxury flex-1 min-w-[200px]"
              />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-luxury"
              >
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {columns.map(col => (
                        <th key={col.key} className="text-left px-6 py-3 font-semibold text-sm">
                          {col.label}
                        </th>
                      ))}
                      <th className="text-left px-6 py-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        {columns.map(col => (
                          <td key={col.key} className="px-6 py-4 text-sm">
                            {col.render ? col.render((user as any)[col.key]) : (user as any)[col.key]}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setNewRole(user.role)
                              }}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                            >
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {editingUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <h2 className="text-xl font-bold mb-4">Change Role for {editingUser.full_name}</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">New Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'client' | 'admin')}
                      className="input-luxury w-full"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleChangeRole(editingUser, newRole)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

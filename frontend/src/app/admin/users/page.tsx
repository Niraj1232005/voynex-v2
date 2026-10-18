'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((res: any) => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        setUsers(dataArray.map((u: any) => ({
          id: u._id || u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Anonymous',
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email,
          role: u.role || 'TRAVELER',
          joined: new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          isActive: u.isActive !== undefined ? u.isActive : true,
        })));
      })
      .catch(err => {
        console.error('Error fetching admin users:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleToggleStatus = (id: string, currentIsActive: boolean) => {
    const actionText = currentIsActive ? 'suspend' : 'activate';
    api.patch(`/admin/users/${id}/suspend`, { isActive: !currentIsActive })
      .then(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentIsActive } : u));
        showToast(`User successfully ${currentIsActive ? 'suspended' : 'activated'}`, 'info');
      })
      .catch(err => showToast(err.message || `Failed to ${actionText} user`, 'error'));
  };

  const handleDeleteUser = (id: string, email: string) => {
    api.delete(`/admin/users/${id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
        showToast(`User ${email} deleted`, 'info');
      })
      .catch(err => showToast(err.message || 'Failed to delete user', 'error'));
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSaving(true);

    api.patch('/users/profile', { firstName: editFirstName, lastName: editLastName })
      .then(() => {
        showToast('User profile updated successfully!', 'success');
        setEditingUser(null);
        fetchUsers();
      })
      .catch(err => showToast(err.message || 'Failed to update user profile', 'error'))
      .finally(() => setEditSaving(false));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-sm text-muted mt-1">Manage and moderate all registered users and travelers</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-10 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr>
              <th className="p-4 font-medium text-muted">Name</th>
              <th className="p-4 font-medium text-muted">Email</th>
              <th className="p-4 font-medium text-muted">Role</th>
              <th className="p-4 font-medium text-muted">Joined</th>
              <th className="p-4 font-medium text-muted">Status</th>
              <th className="p-4 font-medium text-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">No users found matching your search.</td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-hover/30">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-muted">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{u.joined}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.isActive ? 'bg-teal/10 text-teal' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button 
                      onClick={() => handleOpenEdit(u)} 
                      title="Edit User Profile"
                      className="p-1.5 text-muted hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <FiEdit size={16}/>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.isActive)} 
                      title={u.isActive ? 'Suspend User' : 'Activate User'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        u.isActive ? 'text-muted hover:text-orange-500 hover:bg-orange-500/10' : 'text-teal hover:bg-teal/10'
                      }`}
                    >
                      {u.isActive ? <FiUserX size={16}/> : <FiUserCheck size={16}/>}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.email)} 
                      title="Delete User"
                      className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <FiTrash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">Edit User Profile</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Last Name"
                  />
                </div>
                <div className="text-xs text-muted">
                  Email: <span className="font-mono text-foreground">{editingUser.email}</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-sm font-medium text-muted hover:text-foreground rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
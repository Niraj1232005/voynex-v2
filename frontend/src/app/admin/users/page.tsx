'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => {
        const dataArray = res && res.data ? res.data : Array.isArray(res) ? res : [];
        const mapped = dataArray.map((u: any) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email.split('@')[0],
          email: u.email,
          role: u.role || 'user',
          joined: new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          isActive: u.isActive !== false,
        }));
        setUsers(mapped);
      })
      .catch(err => {
        console.error('Error loading global admin users:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleToggleStatus = (id: string, currentIsActive: boolean) => {
    const actionText = currentIsActive ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    api.patch(`/admin/users/${id}/suspend`, { isActive: !currentIsActive })
      .then(() => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentIsActive } : u));
      })
      .catch(err => alert(err.message || `Failed to ${actionText} user`));
  };

  const handleDeleteUser = (id: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${email}? This action cannot be undone.`)) return;

    api.delete(`/admin/users/${id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
      })
      .catch(err => alert(err.message || 'Failed to delete user'));
  };

  const handleEditUser = (user: any) => {
    const newFirstName = prompt('Enter new First Name:', user.firstName || '');
    if (newFirstName === null) return;
    const newLastName = prompt('Enter new Last Name:', user.lastName || '');
    if (newLastName === null) return;

    api.patch('/users/profile', { firstName: newFirstName, lastName: newLastName })
      .then(() => {
        fetchUsers();
      })
      .catch(err => alert(err.message || 'Failed to update user profile'));
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
                      onClick={() => handleEditUser(u)} 
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
    </div>
  );
}
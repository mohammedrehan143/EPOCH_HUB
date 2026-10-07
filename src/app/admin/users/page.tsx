'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { User, Domain, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, Search, Edit2, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editDomainId, setEditDomainId] = useState('');
  const [editActive, setEditActive] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (domainFilter) params.append('domainId', domainFilter);
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/domains')
      .then(res => res.json())
      .then(d => setDomains(d.domains || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, domainFilter, roleFilter]);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditDomainId(user.domain_id || '');
    setEditActive(user.is_active);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          domain_id: editDomainId || null,
          is_active: editActive
        })
      });

      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Member Directory & Roles</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Assign club permissions, manage domain allocations, or deactivate departing accounts safely without breaking audit records.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Domains</option>
          {domains.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="domain_head">Domain Head</option>
          <option value="member">Member</option>
          <option value="reviewer">Reviewer</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="p-0 border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={u.profile_image} name={u.name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-100">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.position || 'Contributor'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        u.role === 'super_admin' ? 'purple' : u.role === 'domain_head' ? 'primary' : u.role === 'reviewer' ? 'warning' : 'default'
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {u.domain_name ? `${u.domain_name} Domain` : 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.phone}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-400">
                    +{u.total_points || 0} pts
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.is_active === 1 ? (
                      <span className="text-emerald-400 text-[10px] font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-rose-400 text-[10px] font-semibold flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit Member: ${editingUser?.name}`}
        description="Update domain assignment, system role, and active status."
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <Select
            label="System Role *"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as UserRole)}
            options={[
              { value: 'member', label: 'Domain Member' },
              { value: 'domain_head', label: 'Domain Head' },
              { value: 'reviewer', label: 'Quality Reviewer' },
              { value: 'super_admin', label: 'Super Admin' },
            ]}
          />

          <Select
            label="Domain Assignment *"
            value={editDomainId}
            onChange={(e) => setEditDomainId(e.target.value)}
            options={[
              { value: '', label: 'None / General' },
              ...domains.map(d => ({ value: d.id, label: `${d.name} Domain` }))
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Account Status</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={editActive === 1}
                  onChange={() => setEditActive(1)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Active (Can login & claim tasks)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                <input
                  type="radio"
                  name="activeStatus"
                  checked={editActive === 0}
                  onChange={() => setEditActive(0)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>Deactivated (Soft deleted)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Save User Updates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

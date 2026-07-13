import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Shield, ShieldCheck, User, RefreshCw, ChefHat } from 'lucide-react';
import { useAuth } from '@clerk/react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ClerkUser {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string;
  role: string;
  lastSignInAt: number | null;
  createdAt: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  admin: { label: 'Admin', color: 'text-red-600', bg: 'bg-red-100', icon: ShieldCheck },
  manager: { label: 'Manager', color: 'text-orange-600', bg: 'bg-orange-100', icon: Shield },
  kitchen: { label: 'Kitchen', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ChefHat },
  user: { label: 'User', color: 'text-blue-600', bg: 'bg-blue-100', icon: User },
};

const ROLE_OPTIONS = ['user', 'manager', 'kitchen', 'admin'] as const;

export default function AdminUsers() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/users', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('Could not load users');
      if (import.meta.env.DEV) console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(API_BASE + '/api/users/' + userId + '/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      alert('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    );
  });

  const counts = {
    all: users.length,            admin: users.filter((u) => u.role === 'admin').length,
    manager: users.filter((u) => u.role === 'manager').length,
    kitchen: users.filter((u) => u.role === 'kitchen').length,
    user: users.filter((u) => u.role === 'user').length,
  };

  return (
    <section className="min-h-screen bg-[#FDF5E6]">
      {/* Header */}
      <div className="bg-[#C41E3A] px-6 md:px-12 py-6 border-b-4 border-[#FFB81C]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-retro text-4xl md:text-5xl text-white uppercase tracking-wide leading-none">
                User Management
              </h2>
              <p className="text-[#FFB81C] text-sm font-black uppercase tracking-wider mt-1">
                Staff &amp; Roles
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'admin', 'manager', 'kitchen', 'user'] as const).map((key) => (
              <span key={key}
                className={`px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider border-2 ${
                  key === 'all'
                    ? 'bg-white/15 text-white/80 border-white/20'
                    : ROLE_CONFIG[key]?.bg + ' ' + ROLE_CONFIG[key]?.color + ' border-transparent'
                }`}
              >
                {key === 'all' ? 'All' : ROLE_CONFIG[key]?.label || key} ({counts[key]})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C41E3A]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white border-2 border-[#C41E3A]/15 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium placeholder-[#C41E3A]/30 focus:border-[#C41E3A] outline-none transition-all"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border-2 border-[#C41E3A]/10 rounded-[24px] p-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C41E3A]/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#C41E3A]/10 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-[#C41E3A]/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-400 rounded-[24px] p-8 text-center">
            <p className="font-bold text-red-600 mb-3">{error}</p>
            <button onClick={fetchUsers} className="bg-red-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider cursor-pointer">Retry</button>
          </div>
        )}

        {/* User List */}
        {!loading && !error && (
          <div className="space-y-2">
            {filtered.map((user) => {
              const RoleIcon = ROLE_CONFIG[user.role]?.icon || User;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-[#C41E3A]/10 rounded-[20px] p-4 flex items-center gap-4 hover:border-[#C41E3A]/25 transition-all"
                >
                  <img
                    src={user.imageUrl}
                    alt={user.firstName || user.email}
                    className="w-10 h-10 rounded-full border-2 border-[#C41E3A]/10 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#C41E3A]">
                        {user.firstName || user.lastName ? (user.firstName || '') + ' ' + (user.lastName || '') : 'User'}
                      </span>
                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_CONFIG[user.role]?.bg} ${ROLE_CONFIG[user.role]?.color}`}>
                        <RoleIcon className="w-2.5 h-2.5" />
                        {ROLE_CONFIG[user.role]?.label || 'User'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#C41E3A]/50 truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      disabled={updatingId === user.id}
                      className="bg-white border-2 border-[#C41E3A]/20 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#C41E3A] focus:border-[#C41E3A] outline-none cursor-pointer disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                      ))}
                    </select>
                    {updatingId === user.id && (
                      <RefreshCw className="w-3.5 h-3.5 text-[#C41E3A]/40 animate-spin" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

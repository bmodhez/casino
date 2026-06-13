'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Mail, Calendar, Shield, Loader2, Search } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  coins: number;
  level: number;
  role: string;
  createdAt: string;
  totalGames: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) {
          if (res.status === 403) {
            router.push('/dashboard');
            return;
          }
          throw new Error('Failed to fetch users');
        }
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, status, router]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
        </div>
        <p className="text-slate-400">Manage users and view registration data</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-sm text-slate-400">Total Users</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-slate-400">Admins</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'USER').length}
              </div>
              <div className="text-sm text-slate-400">Regular Users</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--accent)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Username</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Coins</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Level</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Games</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-yellow-400">{user.coins.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{user.level}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{user.totalGames}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg mb-1">{user.username}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'ADMIN' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[var(--accent)] rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Coins</div>
                  <div className="font-mono font-bold text-yellow-400">{user.coins.toLocaleString()}</div>
                </div>
                <div className="bg-[var(--accent)] rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">Level</div>
                  <div className="font-bold text-white">{user.level}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="text-slate-400">
                  <span className="font-medium text-white">{user.totalGames}</span> games played
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No users found
          </div>
        )}
      </motion.div>
    </div>
  );
}

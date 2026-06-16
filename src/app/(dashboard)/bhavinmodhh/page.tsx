'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Shield, Users, Coins, TrendingUp, Ban, UserCheck, 
  Search, Filter, ChevronDown, AlertTriangle, Eye, Trash2
} from 'lucide-react';
import { formatCoins } from '@/lib/utils';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  coins: number;
  level: number;
  banned: boolean;
  createdAt: string;
  totalGamesPlayed: number;
  totalWagered: number;
  totalPayout: number;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalCoinsInCirculation: number;
  totalGamesPlayed: number;
  totalWagered: number;
  totalPayout: number;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (session?.user && (session.user as any).role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats'),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json() as { users: User[] };
        setUsers(usersData.users || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json() as Stats;
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setMsg('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, shouldBan: boolean) => {
    setActionLoading(true);
    setMsg('');
    
    try {
      const res = await fetch('/api/admin/users/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, banned: shouldBan }),
      });

      if (res.ok) {
        setMsg(shouldBan ? 'User banned successfully' : 'User unbanned successfully');
        fetchData();
      } else {
        setMsg('Failed to update user status');
      }
    } catch (error) {
      setMsg('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustCoins = async (userId: string, amount: number) => {
    setActionLoading(true);
    setMsg('');
    
    console.log('[Admin] Adjusting coins:', { userId, amount });
    
    try {
      const res = await fetch('/api/admin/users/adjust-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });

      console.log('[Admin] Response status:', res.status);
      const data = await res.json() as { success?: boolean; message?: string; error?: string };
      console.log('[Admin] Response data:', data);

      if (res.ok) {
        setMsg(`Coins adjusted by ${amount > 0 ? '+' : ''}${formatCoins(amount)}`);
        await fetchData(); // Refresh data
        setSelectedUser(null);
      } else {
        setMsg(data.error || 'Failed to adjust coins');
      }
    } catch (error) {
      console.error('[Admin] Error adjusting coins:', error);
      setMsg('Network error: ' + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Manage users and monitor system</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-blue-400">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</div>
            <div className="text-xs text-slate-400">
              {stats.activeUsers} active • {stats.bannedUsers} banned
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-amber-400">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-medium">Total Coins</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatCoins(stats.totalCoinsInCirculation)}
            </div>
            <div className="text-xs text-slate-400">In circulation</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total Wagered</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatCoins(stats.totalWagered)}
            </div>
            <div className="text-xs text-slate-400">{stats.totalGamesPlayed} games played</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-purple-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Total Payout</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {formatCoins(stats.totalPayout)}
            </div>
            <div className="text-xs text-slate-400">
              House edge: {((1 - stats.totalPayout / Math.max(stats.totalWagered, 1)) * 100).toFixed(1)}%
            </div>
          </motion.div>
        </div>
      )}

      {/* Message */}
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-xl p-4 border ${
            msg.includes('success') || msg.includes('adjusted')
              ? 'border-green-500/30 bg-green-500/10'
              : 'border-red-500/30 bg-red-500/10'
          }`}
        >
          <p className={msg.includes('success') || msg.includes('adjusted') ? 'text-green-400' : 'text-red-400'}>
            {msg}
          </p>
        </motion.div>
      )}

      {/* Users Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-white mb-4">User Management</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="input-field pl-10 w-full"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Users</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">User</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Email</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-400">Role</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Coins</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-slate-400">Level</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">Status</th>
                <th className="text-center py-3 px-2 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-2 text-sm text-white">{user.username}</td>
                  <td className="py-3 px-2 text-sm text-slate-400">{user.email}</td>
                  <td className="py-3 px-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-right font-mono text-yellow-400">
                    {formatCoins(user.coins)}
                  </td>
                  <td className="py-3 px-2 text-sm text-right text-white">{user.level}</td>
                  <td className="py-3 px-2 text-center">
                    {user.banned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                        <Ban className="w-3 h-3" /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                        <UserCheck className="w-3 h-3" /> Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Manage"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleBanUser(user.id, !user.banned)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded transition-colors ${
                            user.banned
                              ? 'hover:bg-green-500/20 text-green-400'
                              : 'hover:bg-red-500/20 text-red-400'
                          }`}
                          title={user.banned ? 'Unban' : 'Ban'}
                        >
                          {user.banned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Manage User</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Username</p>
                <p className="text-white font-medium">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Current Balance</p>
                <p className="text-yellow-400 font-mono font-bold">{formatCoins(selectedUser.coins)}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <p className="text-sm text-slate-400 font-medium">Adjust Coins</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAdjustCoins(selectedUser.id, 1000)}
                  disabled={actionLoading}
                  className="btn-success text-sm py-2"
                >
                  +1,000
                </button>
                <button
                  onClick={() => handleAdjustCoins(selectedUser.id, 10000)}
                  disabled={actionLoading}
                  className="btn-success text-sm py-2"
                >
                  +10,000
                </button>
                <button
                  onClick={() => handleAdjustCoins(selectedUser.id, -1000)}
                  disabled={actionLoading}
                  className="btn-secondary text-sm py-2"
                >
                  -1,000
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

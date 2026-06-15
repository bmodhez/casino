'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  User, Mail, Calendar, Coins, Trophy, TrendingUp, 
  Shield, Edit, Eye, EyeOff, Copy, Check, RefreshCw, Lock, Save, X
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins, getRankFromLevel } from '@/lib/utils';

interface UserProfile {
  username: string;
  email: string;
  coins: number;
  xp: number;
  level: number;
  createdAt: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalWagered: number;
  totalPayout: number;
  rank: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { coins, level, updateCoins } = useGameStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSeed, setShowSeed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seedData, setSeedData] = useState<any>(null);
  
  // Email reveal state
  const [showEmail, setShowEmail] = useState(false);
  
  // Username change states
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState('');
  
  // Password change states
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const rank = getRankFromLevel(level);

  useEffect(() => {
    fetchProfile();
    fetchSeedInfo();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) {
        console.error('Profile fetch failed:', res.status);
        setLoading(false);
        return;
      }
      const data = await res.json() as UserProfile;
      if (data.username) {
        setProfile(data);
        setNewUsername(data.username);
        updateCoins(data.coins);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeedInfo = async () => {
    try {
      const res = await fetch('/api/user/seeds');
      if (!res.ok) {
        console.error('Seed fetch failed:', res.status);
        return;
      }
      const data = await res.json() as { activeSeed: any };
      if (data.activeSeed) {
        setSeedData(data.activeSeed);
      }
    } catch (error) {
      console.error('Failed to fetch seed:', error);
    }
  };

  const rotateSeed = async () => {
    try {
      const res = await fetch('/api/user/seeds/rotate', { method: 'POST' });
      if (!res.ok) {
        console.error('Seed rotation failed:', res.status);
        return;
      }
      const data = await res.json() as { newSeed: any };
      if (data.newSeed) {
        setSeedData(data.newSeed);
      }
    } catch (error) {
      console.error('Failed to rotate seed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateUsername = async () => {
    if (newUsername.length < 3) {
      setUsernameMsg('Username must be at least 3 characters');
      return;
    }
    
    setUsernameLoading(true);
    setUsernameMsg('');
    
    try {
      const res = await fetch('/api/user/update-username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to update username' })) as { error: string };
        setUsernameMsg(data.error || 'Failed to update username');
        setUsernameLoading(false);
        return;
      }

      await res.json();
      setProfile({ ...profile!, username: newUsername });
      setEditingUsername(false);
      setUsernameMsg('Username updated successfully!');
      setTimeout(() => setUsernameMsg(''), 3000);
    } catch (error) {
      setUsernameMsg('An error occurred');
    } finally {
      setUsernameLoading(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMsg('');
    
    try {
      const res = await fetch('/api/user/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to update password' })) as { error: string };
        setPasswordMsg(data.error || 'Failed to update password');
        setPasswordLoading(false);
        return;
      }

      await res.json();
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('Password updated successfully!');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (error) {
      setPasswordMsg('An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="text-[var(--muted-foreground)] mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">Failed to load profile</p>
      </div>
    );
  }

  const winRate = profile.totalGamesPlayed > 0 
    ? ((profile.totalWins / profile.totalGamesPlayed) * 100).toFixed(1)
    : '0.0';

  // Mask email function
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (!domain) return email;
    const maskedUsername = username.substring(0, 2) + '****';
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 min-h-[calc(100vh-200px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">{profile.username}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400 text-sm">
              {showEmail ? profile.email : maskEmail(profile.email)}
            </p>
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title={showEmail ? 'Hide email' : 'Show email'}
            >
              {showEmail ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-amber-500">
            <Coins className="w-5 h-5" />
            <span className="text-sm font-medium">Balance</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{formatCoins(profile.coins)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-blue-500">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Level</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {profile.level}
            <span className="text-sm text-slate-400 ml-2 font-normal">{rank.name}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-purple-500">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Rank</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            #{profile.rank}
            <span className="text-sm text-slate-400 ml-2 font-normal">Global</span>
          </div>
        </motion.div>

        {profile.totalGamesPlayed > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-xl p-5 space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">{winRate}%</div>
            </motion.div>
          </>
        )}

        {profile.totalGamesPlayed === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-xl p-5 space-y-2"
          >
            <div className="flex items-center gap-2 text-purple-500">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Total Games</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">0</div>
          </motion.div>
        )}
      </div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="glass rounded-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
        
        {/* Username Change */}
        <div className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-medium">Username</span>
            </div>
            {!editingUsername && (
              <button
                onClick={() => setEditingUsername(true)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Change
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {editingUsername ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New username"
                  className="input-field w-full"
                  disabled={usernameLoading}
                />
                
                {usernameMsg && (
                  <p className={`text-sm ${usernameMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {usernameMsg}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={updateUsername}
                    disabled={usernameLoading}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {usernameLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setNewUsername(profile.username);
                      setUsernameMsg('');
                    }}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <p className="text-white font-mono">{profile.username}</p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Change */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-medium">Password</span>
            </div>
            {!editingPassword && (
              <button
                onClick={() => setEditingPassword(true)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Change
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {editingPassword ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="input-field w-full pr-10"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="input-field w-full pr-10"
                    disabled={passwordLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="input-field w-full"
                  disabled={passwordLoading}
                />
                
                {passwordMsg && (
                  <p className={`text-sm ${passwordMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {passwordMsg}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={updatePassword}
                    disabled={passwordLoading}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {passwordLoading ? 'Saving...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMsg('');
                    }}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <p className="text-slate-400 text-sm">••••••••</p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Detailed Stats */}
      {profile.totalGamesPlayed > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Total Wagered</span>
              <span className="font-mono font-semibold text-white">{formatCoins(profile.totalWagered)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Total Earned</span>
              <span className="font-mono font-semibold text-emerald-400">{formatCoins(profile.totalPayout)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Games Won</span>
              <span className="font-mono font-semibold text-white">{profile.totalWins}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Member Since</span>
              <span className="font-mono font-semibold text-white">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Games Played Yet</h3>
          <p className="text-slate-400 text-sm mb-6">Start playing to see your statistics here!</p>
          <Link href="/games/mines">
            <button className="btn-primary">
              Play Your First Game
            </button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}

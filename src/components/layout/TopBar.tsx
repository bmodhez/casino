'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gift, ChevronDown, LogOut, User, Shield, LogIn, UserPlus } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins, getRankFromLevel } from '@/lib/utils';

interface TopBarProps {
  user: { id: string; name?: string; email?: string; image?: string; username?: string; coins?: number; role?: string } | null;
}

export function TopBar({ user }: TopBarProps) {
  // Version: 2.0 - XL breakpoint fix for mobile dropdown
  const { data: session, status } = useSession();
  const { coins, level, updateCoins } = useGameStore();
  const [showMenu, setShowMenu] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyMsg, setDailyMsg] = useState('');
  const rank = getRankFromLevel(level);
  const sessionUser = session?.user;
  const isAuthenticated = !!(user || (status === 'authenticated' && sessionUser));
  const isGuest = !isAuthenticated;
  const displayUser = user || sessionUser || null;

  useEffect(() => {
    if (isGuest) return;
    // Fetch live balance
    fetch('/api/user/balance').then(r => r.json() as Promise<{ coins: number }>).then(data => {
      if (data.coins !== undefined) updateCoins(data.coins);
    }).catch(() => {});
  }, [updateCoins, isGuest]);

  const claimDaily = async () => {
    setDailyLoading(true);
    setDailyMsg('');
    const res = await fetch('/api/user/daily', { method: 'POST' });
    const data = await res.json() as { success: boolean; coins: number; reward: number; error?: string };
    if (data.success) {
      updateCoins(data.coins);
      setDailyMsg(`+${data.reward} coins!`);
    } else {
      setDailyMsg(data.error || 'Error');
    }
    setDailyLoading(false);
    setTimeout(() => setDailyMsg(''), 3000);
  };

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0c101a]/90 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 flex-shrink-0 relative z-20">
      {/* Left side */}
      {!isGuest ? (
        <motion.div
          className="flex items-center gap-2.5 glass px-4 py-2 rounded-xl cursor-default"
          whileHover={{ scale: 1.02 }}
        >
          <Coins className="w-4 h-4 text-yellow-400" />
          <motion.span
            key={coins}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-bold text-white text-sm font-mono"
          >
            {formatCoins(coins)}
          </motion.span>
          <span className="text-slate-500 text-xs">coins</span>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0 lg:hidden">
            <img 
              src="/arenalogo.png" 
              alt="MinesArena Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-lg tracking-tight lg:hidden" style={{
            background: 'linear-gradient(135deg, #e0d4ff 0%, #a78bfa 20%, #8b5cf6 45%, #06b6d4 75%, #10b981 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
            letterSpacing: '-0.02em'
          }}>
            MinesArena
          </span>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3">
        {isGuest ? (
          /* Guest: Show Login + Sign Up buttons */
          <>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all text-sm font-medium text-slate-300"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </motion.button>
            </Link>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </motion.button>
            </Link>
          </>
        ) : (
          /* Authenticated User */
          <>
            {/* Daily Reward */}
            <div className="relative">
              <motion.button
                onClick={claimDaily}
                disabled={dailyLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/25 hover:border-amber-500/40 transition-all text-sm font-medium text-amber-300"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Daily</span>
              </motion.button>
              <AnimatePresence>
                {dailyMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute top-12 right-0 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap z-50 ${
                      dailyMsg.startsWith('+') ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}
                  >
                    {dailyMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu - Desktop only (hidden below 1280px) */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all"
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rank.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {((displayUser as any)?.username || displayUser?.name || 'U')[0].toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-none">{(displayUser as any)?.username || displayUser?.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: rank.color }}>{rank.name}</div>
                </div>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 glass rounded-xl py-2 shadow-2xl shadow-black/50 z-50 border border-white/10"
                  >
                    <Link href="/profile" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-slate-300 hover:text-white">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    {(displayUser as any)?.role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-purple-400">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    {/* Logout button - Desktop only */}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-400 w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Link - Mobile/Tablet only (below 1280px) */}
            <Link href="/profile" className="xl:hidden">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rank.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                {((displayUser as any)?.username || displayUser?.name || 'U')[0].toUpperCase()}
              </div>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import {
  Coins, LayoutDashboard, Bomb, Dice5,
  CircleDot, Triangle, Trophy, User,
  LogIn, UserPlus, LogOut, Shield, Gift, ChevronDown
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins, getRankFromLevel } from '@/lib/utils';
import { RewardsModal } from '@/components/rewards/RewardsModal';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { type: 'divider', label: 'GAMES' },
  { label: 'Mines', href: '/games/mines', icon: Bomb },
  { label: 'Dice', href: '/games/dice', icon: Dice5 },
  { label: 'Coinflip', href: '/games/coinflip', icon: CircleDot },
  { label: 'Plinko', href: '/games/plinko', icon: Triangle },
  { type: 'divider', label: 'MORE' },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { coins, level, updateCoins } = useGameStore();
  const [showMenu, setShowMenu] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyMsg, setDailyMsg] = useState('');
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const rank = getRankFromLevel(level);
  const isAuthenticated = status === 'authenticated';
  const displayUser = session?.user ?? null;

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/user/balance')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch balance');
        return r.json();
      })
      .then(data => {
        if (data.coins !== undefined) updateCoins(data.coins);
      })
      .catch(() => {});
  }, [updateCoins, isAuthenticated]);

  const claimDaily = async () => {
    setDailyLoading(true);
    setDailyMsg('');
    const res = await fetch('/api/user/daily', { method: 'POST' });
    const data = await res.json();
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
    <motion.aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="sidebar-desktop flex-shrink-0 flex flex-col overflow-y-auto bg-[var(--sidebar-bg)] border-r border-[var(--border)] relative z-40"
    >
      <RewardsModal isOpen={showRewardsModal} onClose={() => setShowRewardsModal(false)} />
      
      <div className="px-4 py-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 flex-shrink-0">
            <img 
              src="/arenalogo.png" 
              alt="MinesArena Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-base text-[var(--foreground)] tracking-tight whitespace-nowrap"
            >
              MinesArena
            </motion.span>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {navItems.map((item, i) => {
            if (item.type === 'divider') {
              return isExpanded ? (
                <div key={i} className="sidebar-section-label first:mt-0">
                  {item.label}
                </div>
              ) : (
                <div key={i} className="h-px bg-[var(--border)] my-2" />
              );
            }
            
            // Hide admin-only links for non-admin users
            if ((item as any).adminOnly && displayUser && (displayUser as any).role !== 'ADMIN') {
              return null;
            }
            
            const Icon = item.icon!;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`sidebar-link ${isActive ? 'active' : ''} ${!isExpanded ? 'justify-center' : ''}`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-[var(--border)] px-3 py-3 bg-[var(--sidebar-bg)]">
        {!isAuthenticated ? (
          <div className="flex flex-col gap-2">
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`btn-secondary w-full text-sm ${!isExpanded ? 'px-0' : ''}`}
                title={!isExpanded ? 'Login' : undefined}
              >
                <LogIn className="w-4 h-4" />
                {isExpanded && 'Login'}
              </motion.button>
            </Link>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`btn-primary w-full text-sm ${!isExpanded ? 'px-0' : ''}`}
                title={!isExpanded ? 'Sign Up' : undefined}
              >
                <UserPlus className="w-4 h-4" />
                {isExpanded && 'Sign Up'}
              </motion.button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {isExpanded ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                  <motion.span
                    key={coins}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="font-semibold text-[var(--foreground)] text-sm font-mono flex-1"
                  >
                    {formatCoins(coins)}
                  </motion.span>
                </div>
                <motion.button
                  onClick={() => setShowRewardsModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-1.5 w-full px-2 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all text-xs font-medium text-amber-600 dark:text-amber-400"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Daily Reward
                </motion.button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center px-2 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]" title={`${formatCoins(coins)} coins`}>
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <motion.button
                  onClick={() => setShowRewardsModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-full px-2 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all"
                  title="Daily Reward"
                >
                  <Gift className="w-5 h-5 text-amber-500" />
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

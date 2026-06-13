'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Swords, Coins, Loader2 } from 'lucide-react';
import { formatCoins, getRankFromLevel } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  username: string;
  image: string | null;
  coins: number;
  level: number;
  xp: number;
  totalGames: number;
  totalWins: number;
  winRate: number;
}

const periods = [
  { key: 'all', label: 'All Time' },
  { key: 'weekly', label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
];

const rankStyles = [
  { border: 'border-yellow-400/30', bg: 'from-yellow-400/10 to-amber-500/5', icon: Crown, iconColor: 'text-yellow-400', medal: '🥇' },
  { border: 'border-slate-300/20', bg: 'from-slate-300/10 to-gray-400/5', icon: Medal, iconColor: 'text-slate-300', medal: '🥈' },
  { border: 'border-amber-600/20', bg: 'from-amber-600/10 to-orange-500/5', icon: Medal, iconColor: 'text-amber-600', medal: '🥉' },
];

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch leaderboard');
        return r.json();
      })
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    // Auto-refresh at 12:00 AM IST
    const checkMidnight = () => {
      const now = new Date();
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const hours = istTime.getUTCHours();
      const minutes = istTime.getUTCMinutes();
      
      // If it's exactly 12:00 AM IST
      if (hours === 0 && minutes === 0) {
        setLoading(true);
        fetch(`/api/leaderboard?period=${period}`)
          .then(r => {
            if (!r.ok) throw new Error('Failed to fetch leaderboard');
            return r.json();
          })
          .then(data => { setUsers(data); setLoading(false); })
          .catch(() => setLoading(false));
      }
    };

    // Check every minute
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-200px)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboard</h1>
            <p className="text-slate-400 text-sm">Top players ranked by coins</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500">Refreshes every 24hrs</p>
          <p className="text-xs text-amber-400 font-medium">at 12:00 AM IST</p>
        </div>
      </motion.div>

      {/* Period Filter */}
      <div className="flex gap-2 mb-6">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p.key
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25 shadow-lg shadow-amber-500/5'
                : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:bg-white/[0.06] hover:text-slate-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {users.map((user, i) => {
              const rank = i + 1;
              const isTop3 = rank <= 3;
              const userRank = getRankFromLevel(user.level);
              const rs = isTop3 ? rankStyles[i] : null;

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                  className={`rounded-2xl transition-all duration-200 hover:bg-white/[0.02] ${
                    isTop3
                      ? `bg-gradient-to-r ${rs!.bg} border ${rs!.border}`
                      : 'bg-white/[0.02] border border-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Rank */}
                    <div className="w-8 text-center shrink-0">
                      {isTop3 ? (
                        <span className="text-xl">{rs!.medal}</span>
                      ) : (
                        <span className="text-sm font-mono font-bold text-slate-500">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${userRank.gradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                      {user.username[0].toUpperCase()}
                    </div>

                    {/* Name & Rank */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm truncate">{user.username}</span>
                        {isTop3 && (
                          <Crown className={`w-3.5 h-3.5 shrink-0 ${rs!.iconColor}`} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium" style={{ color: userRank.color }}>{userRank.name}</span>
                        <span className="text-slate-600 text-xs">Lv.{user.level}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">Games</div>
                        <div className="text-sm font-mono font-semibold text-slate-300">{user.totalGames}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">Win Rate</div>
                        <div className="text-sm font-mono font-semibold text-emerald-400">{user.winRate}%</div>
                      </div>
                    </div>

                    {/* Coins */}
                    <div className="text-right min-w-[100px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <span className={`font-bold font-mono text-sm ${isTop3 ? 'text-white' : 'text-slate-300'}`}>
                          {formatCoins(user.coins)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">coins</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

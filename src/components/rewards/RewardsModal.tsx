'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Coins, Trophy, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAILY_REWARDS = [
  { day: 1, amount: 10, label: 'Day 1' },
  { day: 2, amount: 25, label: 'Day 2' },
  { day: 3, amount: 35, label: 'Day 3' },
  { day: 4, amount: 45, label: 'Day 4' },
  { day: 5, amount: 55, label: 'Day 5' },
  { day: 6, amount: 65, label: 'Day 6' },
  { day: 7, amount: 100, label: 'Day 7' },
];

const WHEEL_SEGMENTS = [
  { amount: 5, color: '#3b82f6' },
  { amount: 10, color: '#10b981' },
  { amount: 15, color: '#f59e0b' },
  { amount: 20, color: '#8b5cf6' },
  { amount: 25, color: '#ef4444' },
  { amount: 30, color: '#06b6d4' },
  { amount: 50, color: '#ec4899' },
  { amount: 75, color: '#f97316' },
  { amount: 100, color: '#14b8a6' },
  { amount: 150, color: '#a855f7' },
  { amount: 200, color: '#eab308' },
];

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const { updateCoins } = useGameStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'wheel'>('daily');
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [canClaimToday, setCanClaimToday] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);
  
  // Wheel states
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchDailyStatus();
      fetchWheelStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!canSpin && isOpen && activeTab === 'wheel') {
      const interval = setInterval(() => {
        fetchWheelStatus();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canSpin, isOpen, activeTab]);

  const fetchDailyStatus = async () => {
    try {
      const res = await fetch('/api/rewards/daily-status');
      if (!res.ok) {
        console.error('Daily status fetch failed:', res.status);
        return;
      }
      const data = await res.json();
      if (data.claimedDays) setClaimedDays(data.claimedDays);
      if (data.currentStreak !== undefined) setCurrentStreak(data.currentStreak);
      if (data.canClaimToday !== undefined) setCanClaimToday(data.canClaimToday);
    } catch (error) {
      console.error('Failed to fetch daily status:', error);
    }
  };

  const fetchWheelStatus = async () => {
    try {
      const res = await fetch('/api/rewards/wheel-status');
      if (!res.ok) {
        console.error('Wheel status fetch failed:', res.status);
        return;
      }
      const data = await res.json();
      if (data.canSpin !== undefined) {
        setCanSpin(data.canSpin);
        if (!data.canSpin && data.timeLeft) {
          updateTimerDisplay(data.timeLeft);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wheel status:', error);
    }
  };

  const updateTimerDisplay = (secondsLeft: number) => {
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    setTimeUntilNextSpin(`${hours}h ${minutes}m ${seconds}s`);
  };

  const claimDailyReward = async (day: number) => {
    if (claimedDays.includes(day) || !canClaimToday || claiming) return;

    setClaiming(true);

    try {
      const res = await fetch('/api/rewards/claim-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Claim failed:', data.error);
        alert(data.error || 'Failed to claim reward');
        setClaiming(false);
        return;
      }

      const data = await res.json();
      
      // Instant update
      setClaimedDays([...claimedDays, day]);
      setCurrentStreak(data.streak);
      setCanClaimToday(false);
      updateCoins(data.newBalance);
      setJustClaimed(day);
      
      // Clear the animation after 2 seconds
      setTimeout(() => setJustClaimed(null), 2000);
    } catch (error) {
      console.error('Failed to claim reward:', error);
      alert('Network error: Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const spinWheel = async () => {
    if (spinning || !canSpin) return;

    setSpinning(true);
    setWheelResult(null);

    try {
      const res = await fetch('/api/rewards/spin-wheel', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to spin wheel' }));
        // Don't log cooldown messages as errors - this is expected behavior
        if (!data.error?.includes('24 hours')) {
          console.error('Spin failed:', data.error);
        }
        setSpinning(false);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        const segmentAngle = 360 / WHEEL_SEGMENTS.length;
        const targetIndex = data.segmentIndex;
        const targetAngle = targetIndex * segmentAngle;
        
        // Add random offset for more natural feel (±10 degrees)
        const randomOffset = (Math.random() - 0.5) * 20;
        
        // Multiple full spins + target angle + random offset
        const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
        const finalRotation = rotation + (spins * 360) + (360 - targetAngle) + randomOffset;

        setRotation(finalRotation);
        
        setTimeout(() => {
          setWheelResult(data.amount);
          setCanSpin(false);
          updateCoins(data.newBalance);
          setSpinning(false);
          fetchWheelStatus(); // Refresh status to get timer
        }, 4500); // Slightly longer for more suspense
      } else {
        setSpinning(false);
      }
    } catch (error) {
      console.error('Failed to spin wheel:', error);
      setSpinning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Rewards Center</h2>
                <p className="text-xs text-slate-400">Claim your daily rewards & spin the wheel!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 pb-0">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Coins className="w-4 h-4 inline mr-2" />
              Daily Streak
            </button>
            <button
              onClick={() => setActiveTab('wheel')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'wheel'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Wheel of Fortune
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'daily' ? (
              <div>
                <div className="text-center mb-4">
                  <p className="text-slate-400 mb-1 text-sm">Current Streak</p>
                  <div className="text-3xl font-bold text-white">
                    {currentStreak} <span className="text-lg text-slate-400">days</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {DAILY_REWARDS.map((reward) => {
                    const isClaimed = claimedDays.includes(reward.day);
                    const isAvailable = reward.day === currentStreak + 1 && canClaimToday && !claiming;
                    const isJustClaimed = justClaimed === reward.day;

                    return (
                      <motion.button
                        key={reward.day}
                        onClick={() => claimDailyReward(reward.day)}
                        disabled={!isAvailable || isClaimed || claiming}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        animate={isJustClaimed ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className={`aspect-square rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all ${
                          isClaimed
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                            : isAvailable
                            ? 'bg-blue-500/20 border-2 border-blue-500 cursor-pointer hover:bg-blue-500/30'
                            : 'bg-white/5 border border-white/10 opacity-50'
                        }`}
                      >
                        <div className="text-xs text-slate-400 font-medium">{reward.label}</div>
                        <Coins className={`w-5 h-5 ${isClaimed ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <div className="text-xs font-bold text-white">{reward.amount}</div>
                        {isClaimed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-emerald-400 font-semibold"
                          >
                            ✓ Claimed
                          </motion.div>
                        )}
                        {isJustClaimed && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: -40 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-2xl font-bold text-emerald-400"
                          >
                            +{reward.amount}
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {!canClaimToday && (
                  <p className="text-center text-amber-400 mt-3 text-xs">
                    Come back tomorrow to continue your streak!
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Wheel Container */}
                <div className="relative w-72 h-72 mb-4">
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                    <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500"></div>
                  </div>

                  {/* Wheel */}
                  <div
                    className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-4 border-white/10"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning ? 'transform 4.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                    }}
                  >
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      {WHEEL_SEGMENTS.map((segment, index) => {
                        const segmentAngle = 360 / WHEEL_SEGMENTS.length;
                        const startAngle = index * segmentAngle - 90;
                        const endAngle = startAngle + segmentAngle;
                        
                        // Convert to radians
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        
                        // Calculate arc path
                        const x1 = 200 + 190 * Math.cos(startRad);
                        const y1 = 200 + 190 * Math.sin(startRad);
                        const x2 = 200 + 190 * Math.cos(endRad);
                        const y2 = 200 + 190 * Math.sin(endRad);
                        
                        // Text position (middle of segment)
                        const textAngle = startAngle + segmentAngle / 2;
                        const textRad = (textAngle * Math.PI) / 180;
                        const textX = 200 + 120 * Math.cos(textRad);
                        const textY = 200 + 120 * Math.sin(textRad);

                        return (
                          <g key={index}>
                            <path
                              d={`M 200 200 L ${x1} ${y1} A 190 190 0 0 1 ${x2} ${y2} Z`}
                              fill={segment.color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={textX}
                              y={textY}
                              fill="white"
                              fontSize="20"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                            >
                              {segment.amount}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Center Circle with Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-amber-400">
                      <img 
                        src="/arenalogo.png" 
                        alt="Arena Logo" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Spin Button */}
                <button
                  onClick={spinWheel}
                  disabled={spinning || !canSpin}
                  className="btn-primary px-6 py-3 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {spinning ? 'Spinning...' : canSpin ? '🎰 Spin the Wheel!' : `⏰ Next spin in ${timeUntilNextSpin}`}
                </button>

                {wheelResult !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border-2 border-amber-500/50 text-center"
                  >
                    <p className="text-xl font-bold text-white mb-1">
                      🎉 You won {wheelResult} coins!
                    </p>
                    <p className="text-slate-400 text-sm">Come back tomorrow for another spin!</p>
                  </motion.div>
                )}

                {!canSpin && wheelResult === null && (
                  <p className="mt-3 text-slate-400 text-center text-sm">
                    You've already spun today. Come back tomorrow!
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

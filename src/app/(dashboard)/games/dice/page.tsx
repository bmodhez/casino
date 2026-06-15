'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, Coins, History } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthModal } from '@/components/AuthModal';

type OverUnder = 'over' | 'under';

interface RollResult {
  roll: number;
  target: number;
  overUnder: OverUnder;
  win: boolean;
  payout: number;
  multiplier: number;
  winChance: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  coins: number;
}

interface HistoryEntry {
  roll: number;
  target: number;
  overUnder: OverUnder;
  win: boolean;
  multiplier: number;
  payout: number;
  timestamp: number;
}

const DICE_FACES: Record<number, string> = {
  0: '🎲', 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

function getDieFace(roll: number): string {
  // Map roll (0-100) to dice face (1-6)
  const face = Math.ceil((roll / 100) * 6);
  const diceIndex = Math.max(1, Math.min(6, face));
  return DICE_FACES[diceIndex];
}

export default function DicePage() {
  const { coins, updateCoins } = useGameStore();
  const { requireAuth, showModal, setShowModal, isAuthenticated } = useAuthGuard();

  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [overUnder, setOverUnder] = useState<OverUnder>('over');
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Refs for auto scroll
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Auto scroll when rolling starts or finishes
  useEffect(() => {
    if (rolling && gameAreaRef.current) {
      // Scroll to game area when rolling starts
      gameAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!rolling && revealed && controlsRef.current) {
      // Scroll to controls when roll finishes
      setTimeout(() => {
        controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1000);
    }
  }, [rolling, revealed]);


  const winChance = overUnder === 'over' ? 100 - target : target;
  const multiplier = parseFloat(((99 / Math.max(winChance, 1)) * 0.99).toFixed(4));
  const potentialPayout = betAmount * multiplier;

  const rollDice = async () => {
    if (rolling) return;
    if (betAmount < 1 || betAmount > coins) { setMsg('Insufficient coins'); return; }

    setRolling(true);
    setResult(null);
    setRevealed(false);
    setMsg('');

    if (!isAuthenticated) {
      const demoRoll = parseFloat((Math.random() * 100).toFixed(2));
      const demoWin = overUnder === 'over' ? demoRoll > target : demoRoll < target;
      const demoPayout = demoWin ? betAmount * multiplier : 0;
      const demoResult: RollResult = {
        roll: demoRoll, target, overUnder, win: demoWin,
        payout: demoPayout, multiplier: demoWin ? multiplier : 0,
        winChance, serverSeedHash: '', clientSeed: '', nonce: 0,
        coins: coins - betAmount + demoPayout,
      };
      updateCoins(coins - betAmount + demoPayout);
      setTimeout(() => {
        setResult(demoResult);
        setRevealed(true);
        setRolling(false);
        setMsg(demoWin ? `🎉 Won ${formatCoins(demoPayout)}` : '💥 Lost');
        setHistory(prev => [{
          roll: demoRoll, target, overUnder, win: demoWin,
          multiplier: demoWin ? multiplier : 0,
          payout: demoPayout, timestamp: Date.now(),
        }, ...prev].slice(0, 20));
      }, 1800);
      return;
    }

    try {
      const res = await fetch('/api/games/dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount, target, overUnder }),
      });
      const data = await res.json() as RollResult & { error?: string };
      if (!res.ok) { setMsg(data.error ?? 'Error'); setRolling(false); return; }

      updateCoins(data.coins);
      setTimeout(() => {
        setResult(data);
        setRevealed(true);
        setRolling(false);
        setMsg(data.win ? `🎉 Won ${formatCoins(data.payout)}` : '💥 Lost');
        setHistory(prev => [{
          roll: data.roll, target: data.target, overUnder: data.overUnder,
          win: data.win, multiplier: data.win ? data.multiplier : 0,
          payout: data.payout, timestamp: Date.now(),
        }, ...prev].slice(0, 20));
      }, 1800);
    } catch {
      setMsg('Network error');
      setRolling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-200px)]">
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg p-2">
            <img src="/dice-removebg-preview.png" alt="Dice" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dice</h1>
            <p className="text-slate-400 text-sm">Roll over or under the target to win</p>
          </div>
        </div>
        
        {/* Balance display - Mobile only */}
        <div className="lg:hidden flex items-center gap-2 glass rounded-xl px-4 py-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-yellow-400 font-mono">{formatCoins(coins)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_240px] gap-6">
        {/* LEFT: Controls */}
        <div className="glass rounded-2xl p-5 space-y-5" ref={controlsRef}>
          {/* Bet Amount */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Bet Amount</label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(Number(e.target.value))}
                className="input-dark pl-10 font-mono"
                min="1"
                max={coins}
                disabled={rolling}
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[10, 50, 100, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v)}
                  disabled={rolling}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-colors text-slate-300 font-mono disabled:opacity-40 border border-white/5"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Over/Under Toggle */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Roll</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOverUnder('over')}
                disabled={rolling}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  overUnder === 'over'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06]'
                } disabled:opacity-40`}
              >
                Over
              </button>
              <button
                onClick={() => setOverUnder('under')}
                disabled={rolling}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  overUnder === 'under'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06]'
                } disabled:opacity-40`}
              >
                Under
              </button>
            </div>
          </div>

          {/* Target Slider */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 flex justify-between">
              <span>Target</span>
              <span className="font-mono text-white">{target}</span>
            </label>
            <input
              type="range"
              min="1"
              max="99"
              value={target}
              onChange={e => setTarget(Number(e.target.value))}
              disabled={rolling}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${target}%, rgba(255,255,255,0.08) ${target}%)`,
                accentColor: '#3b82f6',
              }}
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1</span>
              <span>50</span>
              <span>99</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/5">
              <span className="text-xs text-slate-400">Win Chance</span>
              <span className="text-sm font-bold font-mono text-white">{winChance.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/5">
              <span className="text-xs text-slate-400">Multiplier</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{multiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/5">
              <span className="text-xs text-slate-400">Payout</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{formatCoins(potentialPayout)}</span>
            </div>
          </div>

          {/* Roll Button */}
          <button
            onClick={rollDice}
            disabled={rolling || betAmount < 1 || betAmount > coins}
            className={`w-full py-3 text-base font-bold rounded-xl transition-all ${
              rolling
                ? 'bg-slate-500/30 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
            }`}
          >
            {rolling ? 'Rolling...' : <><Dice5 className="w-5 h-5 inline mr-1.5" /> Roll Dice</>}
          </button>

          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-xl text-center text-sm font-bold ${
                  result?.win
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-red-500/15 text-red-300 border border-red-500/25'
                }`}
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTER: Dice Display */}
        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden" ref={gameAreaRef}>
          {/* Background glow */}
          <AnimatePresence>
            {revealed && result?.win && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(16,185,129,0.12) 0%, transparent 70%)',
                }}
              />
            )}
            {revealed && result && !result.win && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, rgba(239,68,68,0.08) 0%, transparent 70%)',
                }}
              />
            )}
          </AnimatePresence>

          {rolling && !revealed ? (
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                className="text-8xl"
              >
                🎲
              </motion.div>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-lg font-mono text-slate-400"
              >
                Rolling...
              </motion.div>
            </div>
          ) : revealed && result ? (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center gap-4"
            >
              {/* Big number */}
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                className={`text-7xl font-black font-mono tabular-nums ${
                  result.win ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.roll.toFixed(2)}
              </motion.div>

              {/* Die face - Show dice emoji */}
              <div className="text-6xl">🎲</div>

              {/* Result badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className={`px-6 py-2 rounded-full text-sm font-bold ${
                  result.win
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {result.win ? `WON ${formatCoins(result.payout)}` : 'LOST'}
              </motion.div>

              {/* Roll details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4 text-sm text-slate-400"
              >
                <span>Target: <span className="text-white font-mono">{result.target}</span></span>
                <span>Mode: <span className="text-white font-mono uppercase">{result.overUnder}</span></span>
              </motion.div>

              {/* Multiplier */}
              {result.win && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="text-sm text-emerald-400 font-mono"
                >
                  {result.multiplier.toFixed(2)}x multiplier
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-40">
              <div className="text-8xl">🎲</div>
              <div className="text-lg text-slate-500 font-mono">
                {overUnder === 'over' ? '>' : '<'} {target}
              </div>
              <div className="text-sm text-slate-600">
                Set your target and roll
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: History */}
        <div className="space-y-4">
          {/* Recent Rolls */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Recent Rolls</h3>
            </div>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No rolls yet</p>
              ) : (
                history.map((h, i) => (
                  <motion.div
                    key={h.timestamp}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      h.win ? 'bg-emerald-500/8' : 'bg-red-500/8'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${h.win ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.roll.toFixed(2)}
                      </span>
                      <span className="text-slate-500">
                        {h.overUnder === 'over' ? '>' : '<'} {h.target}
                      </span>
                    </div>
                    <span className={`font-mono ${h.win ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {h.win ? `${h.multiplier.toFixed(2)}x` : 'LOST'}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Rolls</span>
                <span className="text-white font-mono">{history.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wins</span>
                <span className="text-emerald-400 font-mono">{history.filter(h => h.win).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Win Rate</span>
                <span className="text-white font-mono">
                  {history.length > 0
                    ? `${(history.filter(h => h.win).length / history.length * 100).toFixed(0)}%`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

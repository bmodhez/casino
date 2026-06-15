'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, History, CircleDot, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthModal } from '@/components/AuthModal';

type CoinSide = 'heads' | 'tails';
type GamePhase = 'idle' | 'flipping' | 'result';

interface FlipResult {
  result: CoinSide;
  choice: CoinSide;
  win: boolean;
  payout: number;
  multiplier: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  coins: number;
}

interface HistoryEntry {
  result: CoinSide;
  choice: CoinSide;
  win: boolean;
  payout: number;
  timestamp: number;
}

export default function CoinflipPage() {
  const { coins, updateCoins } = useGameStore();
  const { showModal, setShowModal, isAuthenticated } = useAuthGuard();

  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<CoinSide | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [result, setResult] = useState<FlipResult | null>(null);
  const [displaySide, setDisplaySide] = useState<CoinSide>('heads');
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [flipCount, setFlipCount] = useState(0);

  const coinRef = useRef<HTMLDivElement>(null);
  
  // Refs for auto scroll
  const coinAreaRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const potentialPayout = betAmount * 1.98;
  
  // Auto scroll when flipping starts
  useEffect(() => {
    if (phase === 'flipping' && coinAreaRef.current) {
      // Scroll to coin area when flipping
      coinAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [phase]);

  const doFlip = async (chosenSide: CoinSide) => {
    if (phase !== 'idle' || betAmount < 1 || betAmount > coins) return;
    if (!isAuthenticated) {
      setChoice(chosenSide);
      setMsg('');
      setDisplaySide(chosenSide);

      const demoResult: CoinSide = Math.random() < 0.5 ? 'heads' : 'tails';
      const demoWin = demoResult === chosenSide;
      const demoPayout = demoWin ? betAmount * 1.98 : 0;
      
      // Set result first so animation knows which direction to spin
      setResult({
        result: demoResult,
        choice: chosenSide,
        win: demoWin,
        payout: demoPayout,
        multiplier: demoWin ? 1.98 : 0,
        serverSeedHash: '', clientSeed: '', nonce: 0,
        coins: coins - betAmount + demoPayout,
      });
      
      // Start flipping animation
      setPhase('flipping');
      updateCoins(coins - betAmount + demoPayout);

      setTimeout(() => {
        setDisplaySide(demoResult);
        setPhase('result');
        setFlipCount(c => c + 1);
        setMsg(demoWin ? `🎉 Won ${formatCoins(demoPayout)}` : '💥 Lost');
        setHistory(prev => [{
          result: demoResult, choice: chosenSide, win: demoWin,
          payout: demoPayout, timestamp: Date.now(),
        }, ...prev].slice(0, 20));
      }, 2000);
      return;
    }

    setChoice(chosenSide);
    setMsg('');
    setDisplaySide(chosenSide);

    try {
      const res = await fetch('/api/games/coinflip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount, choice: chosenSide }),
      });
      const data = await res.json() as FlipResult & { error?: string };
      if (!res.ok) { setMsg(data.error ?? 'Error'); setPhase('idle'); return; }

      // Set result first so animation knows which direction to spin
      setResult(data);
      
      // Start flipping animation
      setPhase('flipping');
      updateCoins(data.coins);
      
      setTimeout(() => {
        setDisplaySide(data.result);
        setPhase('result');
        setFlipCount(c => c + 1);
        setMsg(data.win ? `🎉 Won ${formatCoins(data.payout)}` : '💥 Lost');
        setHistory(prev => [{
          result: data.result, choice: data.choice, win: data.win,
          payout: data.payout, timestamp: Date.now(),
        }, ...prev].slice(0, 20));
      }, 2000);
    } catch {
      setMsg('Network error');
      setPhase('idle');
    }
  };

  const resetFlip = () => {
    setPhase('idle');
    setChoice(null);
    setResult(null);
    setMsg('');
    
    // Scroll back to controls when resetting
    setTimeout(() => {
      controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const wins = history.filter(h => h.win).length;
  const losses = history.length - wins;
  const winRate = history.length > 0 ? (wins / history.length * 100).toFixed(0) : '—';

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-300px)]">
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg p-2">
          <img src="/coins-removebg-preview.png" alt="Coinflip" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Coinflip</h1>
          <p className="text-slate-400 text-sm">Heads or tails — 1.98x payout</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_240px] gap-6">
        {/* LEFT: Controls */}
        <div className="glass rounded-2xl p-5 space-y-5" ref={controlsRef}>
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
                disabled={phase === 'flipping'}
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[10, 50, 100, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v)}
                  disabled={phase === 'flipping'}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-colors text-slate-300 font-mono disabled:opacity-40 border border-white/5"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Pick a Side</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { side: 'heads' as CoinSide, icon: '👑', label: 'HEADS', color: '#f59e0b' },
                { side: 'tails' as CoinSide, icon: '🥈', label: 'TAILS', color: '#a8a29e' },
              ]).map(({ side, icon, label, color }) => (
                <button
                  key={side}
                  onClick={() => doFlip(side)}
                  disabled={phase === 'flipping' || betAmount < 1 || betAmount > coins}
                  className="py-4 rounded-xl text-sm font-bold text-slate-200 disabled:opacity-40"
                  style={{
                    background: choice === side
                      ? `${color}1A`
                      : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${
                      choice === side
                        ? `${color}80`
                        : 'rgba(255,255,255,0.06)'
                    }`,
                    boxShadow: choice === side
                      ? `0 0 24px ${color}26`
                      : 'none',
                    transition: 'all 0.2s ease',
                    transform: 'scale(1)',
                  }}
                  onPointerEnter={e => {
                    if (phase !== 'idle' || choice === side) return;
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = `0 0 20px ${color}26`;
                    e.currentTarget.style.borderColor = `${color}4D`;
                  }}
                  onPointerLeave={e => {
                    if (phase !== 'idle' || choice === side) return;
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div className="text-4xl mb-2 leading-none">{icon}</div>
                  <div>{label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/5">
              <span className="text-xs text-slate-400">Multiplier</span>
              <span className="text-sm font-bold font-mono text-emerald-400">1.98x</span>
            </div>
            <div className="flex justify-between items-center bg-white/[0.03] rounded-xl px-3.5 py-2.5 border border-white/5">
              <span className="text-xs text-slate-400">Payout</span>
              <span className="text-sm font-bold font-mono text-yellow-400">{formatCoins(potentialPayout)}</span>
            </div>
          </div>

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

        {/* CENTER: Coin Display */}
        <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden" ref={coinAreaRef}>
          <AnimatePresence>
            {result?.win && phase === 'result' && (
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
            {result && !result.win && phase === 'result' && (
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

          {/* 3D Coin - always visible */}
          <style>{`
            @keyframes coinSpinHeads {
              0% { 
                transform: rotateX(0deg) rotateY(0deg); 
              }
              60% { 
                transform: rotateX(1080deg) rotateY(216deg); 
              }
              80% { 
                transform: rotateX(1440deg) rotateY(288deg); 
              }
              92% { 
                transform: rotateX(1620deg) rotateY(324deg); 
              }
              98% { 
                transform: rotateX(1755deg) rotateY(351deg); 
              }
              100% { 
                transform: rotateX(1800deg) rotateY(360deg); 
              }
            }
            @keyframes coinSpinTails {
              0% { 
                transform: rotateX(0deg) rotateY(0deg); 
              }
              60% { 
                transform: rotateX(1260deg) rotateY(252deg); 
              }
              80% { 
                transform: rotateX(1620deg) rotateY(324deg); 
              }
              92% { 
                transform: rotateX(1800deg) rotateY(360deg); 
              }
              98% { 
                transform: rotateX(1890deg) rotateY(378deg); 
              }
              100% { 
                transform: rotateX(1980deg) rotateY(396deg); 
              }
            }
          `}</style>
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 180,
                height: 180,
                perspective: 1000,
                position: 'relative',
              }}
            >
              <div
                ref={coinRef}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  animation: phase === 'flipping'
                    ? result?.result === 'tails' 
                      ? 'coinSpinTails 2s ease-out forwards'
                      : 'coinSpinHeads 2s ease-out forwards'
                    : 'none',
                  transform:
                    phase === 'idle' ? 'rotateX(0deg) rotateY(0deg)' :
                    phase === 'result' && result?.result === 'heads' ? 'rotateX(1800deg) rotateY(360deg)' :
                    phase === 'result' && result?.result === 'tails' ? 'rotateX(1980deg) rotateY(396deg)' :
                    'rotateX(0deg) rotateY(0deg)',
                }}
              >
                {/* HEADS face */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: 'radial-gradient(circle at 35% 30%, #fbbf24, #f59e0b 30%, #d97706 60%, #b45309)',
                    boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.15), 0 0 40px rgba(251,191,36,0.2)',
                  }}
                >
                  {/* Outer rim ring */}
                  <div style={{ position: 'absolute', width: '96%', height: '96%', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.1)' }} />
                  {/* Inner rim ring */}
                  <div style={{ position: 'absolute', width: '86%', height: '86%', borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.2)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.15)' }} />
                  {/* Year */}
                  <span style={{ position: 'absolute', top: 28, fontSize: 11, fontWeight: 600, letterSpacing: 1, opacity: 0.6, zIndex: 1 }}>{new Date().getFullYear()}</span>
                  {/* Portrait circle */}
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', zIndex: 1,
                    background: 'radial-gradient(circle at 40% 35%, #fcd34d, #f59e0b 50%, #b45309)',
                    boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 30,
                  }}>👑</div>
                  {/* Embossed text */}
                  <span style={{ position: 'absolute', bottom: 30, fontSize: 12, fontWeight: 800, letterSpacing: 2.5, textShadow: '0 1px 2px rgba(0,0,0,0.3)', zIndex: 1 }}>COINPLAY</span>
                  {/* Stars */}
                  <span style={{ position: 'absolute', bottom: 52, fontSize: 10, letterSpacing: 6, opacity: 0.35, zIndex: 1 }}>✦ ✦ ✦</span>
                </div>

                {/* TAILS face */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transform: 'rotateX(180deg)',
                    background: 'radial-gradient(circle at 35% 30%, #a8a29e, #78716c 30%, #57534e 60%, #44403c)',
                    boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.3), inset 0 4px 12px rgba(255,255,255,0.1), 0 0 40px rgba(120,113,108,0.2)',
                  }}
                >
                  <div style={{ position: 'absolute', width: '96%', height: '96%', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', width: '86%', height: '86%', borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)' }} />
                  <span style={{ position: 'absolute', top: 28, fontSize: 11, fontWeight: 600, letterSpacing: 1, opacity: 0.6, zIndex: 1 }}>{new Date().getFullYear()}</span>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', zIndex: 1,
                    background: 'radial-gradient(circle at 40% 35%, #d4d4d4, #a3a3a3 50%, #78716c)',
                    boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800,
                  }}>$</div>
                  <span style={{ position: 'absolute', bottom: 30, fontSize: 12, fontWeight: 800, letterSpacing: 2.5, textShadow: '0 1px 2px rgba(0,0,0,0.3)', zIndex: 1 }}>1.98x</span>
                  <span style={{ position: 'absolute', bottom: 52, fontSize: 10, letterSpacing: 6, opacity: 0.35, zIndex: 1 }}>✦ ✦ ✦</span>
                </div>
              </div>
            </div>

            {/* Result text */}
            <AnimatePresence mode="wait">
              {phase === 'result' && result && (
                <motion.div
                  key={`result-${flipCount}`}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                  className="mt-6 text-center"
                >
                  <div className={`text-2xl font-black uppercase tracking-widest ${
                    result.win ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.result}
                  </div>
                  <div className={`text-sm font-bold mt-1 ${
                    result.win ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.win
                      ? `+${formatCoins(result.payout)}`
                      : `-${formatCoins(betAmount)}`
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Play Again */}
            {phase === 'result' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                onClick={resetFlip}
                className="mt-4 px-6 py-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/25 text-sm font-semibold hover:bg-amber-500/25 transition-colors"
              >
                Flip Again
              </motion.button>
            )}

            {/* Idle hint */}
            {phase === 'idle' && (
              <div className="mt-6 text-sm text-slate-500 font-mono">Pick a side to flip</div>
            )}
          </div>
        </div>

        {/* RIGHT: History */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Recent Flips</h3>
            </div>
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No flips yet</p>
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
                      <span className={`font-mono font-bold uppercase ${h.win ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.result}
                      </span>
                      <span className="text-slate-500">
                        {h.result === h.choice ? '✓' : '✗'}
                      </span>
                    </div>
                    <span className={`font-mono ${h.win ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {h.win ? `+${formatCoins(h.payout)}` : `-${formatCoins(betAmount)}`}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Flips</span>
                <span className="text-white font-mono">{history.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wins</span>
                <span className="text-emerald-400 font-mono">{wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Losses</span>
                <span className="text-red-400 font-mono">{losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Win Rate</span>
                <span className="text-white font-mono">{winRate}{winRate !== '—' ? '%' : ''}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

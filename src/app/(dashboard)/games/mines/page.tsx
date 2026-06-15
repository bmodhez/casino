'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Gem, Coins } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';
import { calculateMinesMultiplier } from '@/lib/fairness';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthModal } from '@/components/AuthModal';
import { AuthTooltip } from '@/components/AuthTooltip';

type CellState = 'hidden' | 'gem' | 'mine';

interface ClickResponse {
  error?: string;
  result: 'mine' | 'safe' | 'cashout';
  position?: number;
  minePositions?: number[];
  gemsRevealed?: number;
  multiplier?: number;
  coins?: number;
  payout?: number;
}

interface CashoutResponse {
  error?: string;
  coins: number;
  payout: number;
  multiplier: number;
}

export default function MinesPage() {
  const { coins, updateCoins } = useGameStore();
  const { requireAuth, showModal, setShowModal, isAuthenticated } = useAuthGuard();
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [gameActive, setGameActive] = useState(false);
  const [cells, setCells] = useState<CellState[]>(Array(25).fill('hidden'));
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [gemsRevealed, setGemsRevealed] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cellLoading, setCellLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for auto scroll
  const gameGridRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);
  
  // Auto scroll when game starts or ends - MOBILE ONLY
  useEffect(() => {
    // Check if mobile device (screen width < 1024px which is lg breakpoint)
    const isMobile = window.innerWidth < 1024;
    
    if (!isMobile) return; // Skip auto-scroll on desktop
    
    if (gameActive && gameGridRef.current) {
      // Scroll to top (grid) when game starts
      gameGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!gameActive && controlsRef.current && gameOver) {
      // Scroll to controls when game ends
      setTimeout(() => {
        controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [gameActive, gameOver]);

  const handleTooltipShow = () => {
    if (!isAuthenticated) {
      console.log('Showing tooltip - User not authenticated');
      setShowTooltip(true);
      // Auto-hide after 4 seconds on mobile (touch devices)
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 4000);
    } else {
      console.log('Not showing tooltip - User is authenticated');
    }
  };

  const handleTooltipHide = () => {
    console.log('Hiding tooltip');
    setShowTooltip(false);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
  };

  const startGame = async () => {
    if (betAmount > coins || betAmount < 1) { setMsg('Insufficient coins'); return; }
    
    // Check authentication before starting game
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    setLoading(true);
    setMsg('');
    setGameId(null);

    const res = await fetch('/api/games/mines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ betAmount, mineCount }),
    });
    const data = await res.json() as { error?: string; gameId: string; minePositions: number[] };
    if (!res.ok) { setMsg(data.error ?? 'Error'); setLoading(false); return; }

    setGameId(data.gameId);
    setMinePositions(data.minePositions);
    setCells(Array(25).fill('hidden'));
    setGemsRevealed(0);
    setMultiplier(1);
    setGameActive(true);
    setGameOver(false);
    setWon(false);
    updateCoins(coins - betAmount);
    setLoading(false);
  };

  const clickCell = useCallback(async (index: number) => {
    if (!gameActive || gameOver || cells[index] !== 'hidden' || cellLoading !== null) return;

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    console.log('[Mines] Clicking cell:', index);
    console.log('[Mines] Current cells state:', cells);
    setCellLoading(index);
    
    try {
      const res = await fetch('/api/games/mines/click', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, cellIndex: index }),
      });
      
      const data = await res.json() as ClickResponse;
      console.log('[Mines] API Response:', {
        status: res.status,
        ok: res.ok,
        data: data
      });

      if (!res.ok) { 
        setCellLoading(null);
        setMsg(data.error ?? 'Error'); 
        return; 
      }

      // Create new cells array - CRITICAL: Must create fresh array
      const updatedCells = cells.map((cell, i) => i === index ? cell : cell);
      
      // Update cells immediately based on result - Stake style
      if (data.result === 'mine') {
        console.log('[Mines] Hit mine! Revealing all mines:', data.minePositions);
        // Show all mines when hit
        if (data.minePositions && data.minePositions.length > 0) {
          data.minePositions.forEach((pos: number) => {
            updatedCells[pos] = 'mine';
          });
          setMinePositions(data.minePositions);
        }
        setCells(updatedCells);
        console.log('[Mines] Updated cells after mine hit:', updatedCells);
        setCellLoading(null);
        setGameActive(false);
        setGameOver(true);
        setWon(false);
        setMsg('💥 You hit a mine!');
        if (data.coins !== undefined) updateCoins(data.coins);
      } else if (data.result === 'safe') {
        console.log('[Mines] Revealed gem at index:', index);
        // Reveal gem immediately
        updatedCells[index] = 'gem';
        setCells(updatedCells);
        console.log('[Mines] Updated cells after gem reveal:', updatedCells);
        setCellLoading(null);
        
        // Update stats
        if (data.gemsRevealed !== undefined) {
          console.log('[Mines] Gems revealed:', data.gemsRevealed);
          setGemsRevealed(data.gemsRevealed);
        }
        if (data.multiplier !== undefined) {
          console.log('[Mines] Multiplier:', data.multiplier);
          setMultiplier(data.multiplier);
        }
      } else if (data.result === 'cashout') {
        console.log('[Mines] Auto cashout triggered');
        updatedCells[index] = 'gem';
        setCells(updatedCells);
        console.log('[Mines] Updated cells after cashout:', updatedCells);
        setCellLoading(null);
        
        if (data.gemsRevealed !== undefined) setGemsRevealed(data.gemsRevealed);
        if (data.multiplier !== undefined) setMultiplier(data.multiplier);
        if (data.coins !== undefined) updateCoins(data.coins);
        setGameActive(false);
        setGameOver(true);
        setWon(true);
        if (data.payout !== undefined) {
          setMsg(`🎉 Won ${formatCoins(data.payout)} coins! (${data.multiplier?.toFixed(2) || 0}x)`);
        }
      }
    } catch (error) {
      console.error('[Mines] Error:', error);
      setCellLoading(null);
      setMsg('Network error');
    }
  }, [gameActive, gameOver, cells, cellLoading, minePositions, isAuthenticated, gameId, updateCoins]);

  const cashOut = useCallback(async () => {
    if (!gameActive || gemsRevealed === 0 || cellLoading !== null) return;

    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    setCellLoading(-1);
    const res = await fetch('/api/games/mines/cashout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    });
    const data = await res.json() as CashoutResponse;
    setCellLoading(null);

    if (!res.ok) { setMsg(data.error ?? 'Error'); return; }

    updateCoins(data.coins);
    setGameActive(false);
    setGameOver(true);
    setWon(true);
    setMsg(`🎉 Won ${formatCoins(data.payout)} coins! (${data.multiplier.toFixed(2)}x)`);
  }, [gameActive, gemsRevealed, multiplier, betAmount, isAuthenticated, gameId, coins, updateCoins, cellLoading]);

  const safeCells = 25 - mineCount;
  
  // Calculate preview multiplier based on current mine count (for 1 gem revealed)
  const previewMultiplier = gameActive ? multiplier : calculateMinesMultiplier(mineCount, 1);
  const displayMultiplier = gameActive ? multiplier : previewMultiplier;
  
  const potentialPayout = betAmount * (gameActive ? multiplier : previewMultiplier);

  return (
    <div className="max-w-4xl mx-auto px-4 min-h-[calc(100vh-200px)]">
      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
      />

      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center shadow-lg p-2">
            <img src="/mines-removebg-preview.png" alt="Mines" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mines</h1>
            <p className="text-slate-400 text-sm">Reveal gems, avoid the mines</p>
          </div>
        </div>
        
        {/* Balance display - Mobile only */}
        <div className="lg:hidden flex items-center gap-2 glass rounded-xl px-4 py-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-yellow-400 font-mono">{formatCoins(coins)}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Game Grid */}
        <div className="space-y-4" ref={gameGridRef}>
          {/* Cashout button at top - MOBILE ONLY */}
          <AnimatePresence>
            {gameActive && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="lg:hidden"
              >
                <button
                  onClick={cashOut}
                  disabled={gemsRevealed === 0 || cellLoading !== null}
                  className="btn-success w-full py-4 text-base font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {cellLoading === -1 ? 'Processing...' : `💰 Cash Out - ${formatCoins(potentialPayout)} (${displayMultiplier.toFixed(2)}x)`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="glass rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {cells.map((state, i) => (
              <motion.button
                key={i}
                onClick={() => clickCell(i)}
                disabled={!gameActive || gameOver || state !== 'hidden' || cellLoading !== null}
                whileHover={gameActive && state === 'hidden' && cellLoading === null ? { scale: 1.06 } : {}}
                whileTap={gameActive && state === 'hidden' && cellLoading === null ? { scale: 0.94 } : {}}
                className={`mine-cell flex items-center justify-center ${
                  state !== 'hidden' ? 'revealed' : ''
                } ${
                  !gameActive || gameOver ? 'mine-cell-disabled' : ''
                } ${
                  state === 'gem' ? 'gem' : state === 'mine' ? 'mine' : ''
                } ${cellLoading === i ? 'animate-pulse' : ''}`}
                style={{ aspectRatio: '1' }}
              >
                <AnimatePresence>
                  {state === 'gem' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Gem className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  )}
                  {state === 'mine' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Bomb className="w-6 h-6 text-red-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
            </div>

            <AnimatePresence>
              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 p-3 rounded-xl text-center font-bold ${
                    won
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      : 'bg-red-500/15 text-red-300 border border-red-500/25'
                  }`}
                >
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4" ref={controlsRef}>
          <div className="glass rounded-2xl p-5 space-y-4">
            {/* Bet */}
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
                  disabled={gameActive}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[10, 50, 100, 500].map(v => (
                  <button
                    key={v}
                    onClick={() => setBetAmount(v)}
                    disabled={gameActive}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-colors text-slate-300 font-mono disabled:opacity-40 border border-white/5"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Mines */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Mines: <span className="font-mono text-white">{mineCount}</span></label>
              <input
                type="range"
                min="1"
                max="24"
                value={mineCount}
                onChange={e => setMineCount(Number(e.target.value))}
                className="w-full dice-slider"
                disabled={gameActive}
                style={{ '--value': `${(mineCount / 24) * 100}%` } as any}
              />
              <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
                <span>1</span>
                <span>24</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Multiplier</div>
                <div className="font-bold text-white font-mono">{displayMultiplier.toFixed(2)}x</div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                <div className="text-xs text-slate-500 mb-1">Gems Found</div>
                <div className="font-bold text-emerald-400 font-mono">{gemsRevealed}</div>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
              <div className="text-xs text-slate-500 mb-1">Potential Payout</div>
              <div className="font-bold text-yellow-400 font-mono">{formatCoins(potentialPayout)}</div>
            </div>

            {!gameActive ? (
              <div 
                className="relative"
                onMouseEnter={handleTooltipShow}
                onMouseLeave={handleTooltipHide}
                onTouchStart={handleTooltipShow}
              >
                <button
                  onClick={startGame}
                  disabled={loading || betAmount < 1 || betAmount > coins}
                  className="btn-primary w-full py-3 text-base relative"
                >
                  {loading ? 'Starting...' : '🎮 Start Game'}
                </button>
                
                {/* Tooltip for non-authenticated users */}
                <AuthTooltip show={!isAuthenticated && showTooltip} position="top" />
              </div>
            ) : (
              /* Cashout button - DESKTOP ONLY (shown in sidebar) */
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="hidden lg:block"
                >
                  <button
                    onClick={cashOut}
                    disabled={gemsRevealed === 0 || cellLoading !== null}
                    className="btn-success w-full py-3 text-base font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {cellLoading === -1 ? 'Processing...' : `💰 Cash Out - ${formatCoins(potentialPayout)} (${displayMultiplier.toFixed(2)}x)`}
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

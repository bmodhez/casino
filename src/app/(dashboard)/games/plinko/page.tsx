'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Triangle, Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatCoins } from '@/lib/utils';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthModal } from '@/components/AuthModal';

const VALID_ROWS = [8, 12, 16] as const;
const VALID_RISKS = ['LOW', 'MEDIUM', 'HIGH'] as const;

const MULTIPLIER_TABLES: Record<string, Record<number, number[]>> = {
  LOW: {
    8: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    12: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  MEDIUM: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    12: [33, 11, 4, 2, 0.8, 0.7, 0.8, 2, 4, 11, 33],
    16: [110, 41, 10, 5, 3, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3, 5, 10, 41, 110],
  },
  HIGH: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    12: [141, 26, 5.5, 1.4, 0.4, 0.2, 0.4, 1.4, 5.5, 26, 141],
    16: [999, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 999],
  },
};

function getMult(slot: number, rows: number, risk: string): number {
  const table = MULTIPLIER_TABLES[risk]?.[rows];
  if (!table) return 1;
  return table[Math.min(slot, table.length - 1)] ?? 1;
}

function getSlotColor(mult: number): string {
  if (mult >= 50) return '#a855f7';
  if (mult >= 10) return '#ef4444';
  if (mult >= 5) return '#f59e0b';
  if (mult >= 2) return '#10b981';
  if (mult >= 1) return '#6366f1';
  if (mult >= 0.5) return '#6b7280';
  return '#4b5563';
}

function bgAlpha(mult: number): string {
  if (mult >= 50) return 'rgba(168,85,247,0.15)';
  if (mult >= 10) return 'rgba(239,68,68,0.15)';
  if (mult >= 5) return 'rgba(245,158,11,0.15)';
  if (mult >= 2) return 'rgba(16,185,129,0.15)';
  if (mult >= 1) return 'rgba(99,102,241,0.15)';
  return 'rgba(107,114,128,0.10)';
}

interface DropResult {
  paths: boolean[];
  slot: number;
  rows: number;
  risk: string;
  multiplier: number;
  payout: number;
  win: boolean;
  coins: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

interface HistoryEntry {
  multiplier: number;
  payout: number;
  win: boolean;
  rows: number;
  risk: string;
  timestamp: number;
}

const BOARD_W = 440;
const PIN_R = 5;
const BALL_R = 9;
const ROW_H = 40;
const TOP_PAD = 40;
const PIN_SPACING = 32;
const SLOT_H = 52;

const SEG_DURATIONS: Record<number, number> = { 8: 320, 12: 250, 16: 200 };
const FIRST_SEG_DURATION = 300;
const LAST_SEG_DURATION = 400;

interface BezierSeg {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  duration: number;
}

function quadraticBezier(t: number, p0: number, p1: number, p2: number): number {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

export default function PlinkoPage() {
  const { coins, updateCoins } = useGameStore();
  const { showModal, setShowModal, isAuthenticated } = useAuthGuard();

  const [betAmount, setBetAmount] = useState(10);
  const [rows, setRows] = useState<number>(8);
  const [risk, setRisk] = useState<string>('MEDIUM');
  const [dropping, setDropping] = useState(false);
  const [result, setResult] = useState<DropResult | null>(null);
  const [showResultCard, setShowResultCard] = useState(false);
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, wins: 0, bestMult: 0 });
  const [demoMsg, setDemoMsg] = useState('');
  const [hitPins, setHitPins] = useState<Set<string>>(new Set());
  const [landingGlow, setLandingGlow] = useState(false);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pathRef = useRef<boolean[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Refs for auto scroll
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const multipliers = Array.from({ length: rows + 1 }, (_, i) => getMult(i, rows, risk));
  const maxSlotMult = Math.max(...multipliers);
  const minSlotMult = Math.min(...multipliers);
  
  // Auto scroll when dropping starts or finishes
  useEffect(() => {
    if (dropping && gameAreaRef.current) {
      // Scroll to game area when dropping
      gameAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (!dropping && result && controlsRef.current) {
      // Scroll to controls after drop finishes
      setTimeout(() => {
        controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1500);
    }
  }, [dropping, result]);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }

  function playPegHit() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600 + Math.random() * 300;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch { }
  }

  function playDropStart() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 300;
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch { }
  }

  function playLanding(mult: number) {
    try {
      const ctx = getAudioCtx();
      const isBig = mult >= 10;
      const isWin = mult >= 1;
      if (!isWin) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 150;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        return;
      }
      if (isBig) {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const t = ctx.currentTime + i * 0.12;
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
        });
      } else {
        const notes = [400, 500, 600];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          const t = ctx.currentTime + i * 0.08;
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);
        });
      }
    } catch { }
  }

  useEffect(() => {
    const saved = localStorage.getItem('plinko_history');
    if (saved) {
      try {
        const h = JSON.parse(saved) as HistoryEntry[];
        setHistory(h);
        const total = h.length;
        const wins = h.filter(x => x.win).length;
        const bestMult = h.length ? Math.max(...h.map(x => x.multiplier)) : 0;
        setStats({ total, wins, bestMult });
      } catch { }
    }
  }, []);

  const getPinPos = useCallback((row: number, idx: number) => ({
    x: (idx - row / 2) * PIN_SPACING,
    y: TOP_PAD + row * ROW_H,
  }), []);

  const getSlotCenterX = useCallback((slot: number) => {
    return (slot - rows / 2) * PIN_SPACING;
  }, [rows]);

  const boardHeight = TOP_PAD + (rows - 1) * ROW_H + ROW_H + SLOT_H + 20;
  const slotTop = boardHeight - 6 - SLOT_H;

  const computeTrajectory = useCallback((paths: boolean[]): BezierSeg[] => {
    const steps = paths.length;
    const segs: BezierSeg[] = [];
    const segDur = SEG_DURATIONS[rows as keyof typeof SEG_DURATIONS] ?? 250;
    const startX = BOARD_W / 2;
    const startY = TOP_PAD - 15;
    const finalSlot = paths.filter(Boolean).length;
    const finalX = BOARD_W / 2 + getSlotCenterX(finalSlot);
    const finalY = slotTop + 4;

    const pegApproach: { x: number; y: number }[] = [];
    const pegExit: { x: number; y: number }[] = [];

    for (let k = 0; k < steps; k++) {
      const r = paths.slice(0, k).filter(Boolean).length;
      const pegX = BOARD_W / 2 + (r - k / 2) * PIN_SPACING;
      const pegY = TOP_PAD + k * ROW_H;
      const dir = k < steps ? (paths[k] ? 1 : -1) : 0;
      pegApproach.push({ x: pegX - dir * 4, y: pegY - 10 });
      pegExit.push({ x: pegX + dir * 5, y: pegY + 5 });
    }

    segs.push({
      p0: { x: startX, y: startY },
      p1: { x: startX + (pegApproach[0].x - startX) * 0.5, y: startY + (pegApproach[0].y - startY) * 0.7 },
      p2: pegApproach[0],
      duration: FIRST_SEG_DURATION,
    });

    for (let k = 0; k < steps - 1; k++) {
      const p0 = pegExit[k];
      const p2 = pegApproach[k + 1];
      const midX = (p0.x + p2.x) / 2 + (paths[k] ? 1 : -1) * 6;
      const midY = p0.y + (p2.y - p0.y) * 0.65;
      segs.push({ p0, p1: { x: midX, y: midY }, p2, duration: segDur });
    }

    if (steps > 0) {
      const p0 = pegExit[steps - 1];
      const midX = (p0.x + finalX) / 2;
      const midY = p0.y + (finalY - p0.y) * 0.7;
      segs.push({ p0, p1: { x: midX, y: midY }, p2: { x: finalX, y: finalY }, duration: LAST_SEG_DURATION });
    } else {
      segs.push({
        p0: { x: startX, y: startY },
        p1: { x: (startX + finalX) / 2, y: (startY + finalY) / 2 },
        p2: { x: finalX, y: finalY },
        duration: LAST_SEG_DURATION,
      });
    }

    return segs;
  }, [getSlotCenterX, rows]);

  const doDrop = async () => {
    if (dropping) return;
    if (betAmount < 1 || betAmount > coins) return;

    setDropping(true);
    setShowResultCard(false);
    setResult(null);
    setBallPos(null);
    setMsg('');
    setDemoMsg('');
    setHitPins(new Set());
    setLandingGlow(false);

    if (!isAuthenticated) {
      const demoPaths: boolean[] = Array.from({ length: rows }, () => Math.random() < 0.5);
      const demoSlot = demoPaths.filter(Boolean).length;
      const demoMult = getMult(demoSlot, rows, risk);
      const demoPayout = betAmount * demoMult;
      const demoWin = demoPayout >= betAmount;

      playDropStart();
      await animateDrop(demoPaths);
      playLanding(demoMult);
      setResult({
        paths: demoPaths,
        slot: demoSlot,
        rows,
        risk,
        multiplier: demoMult,
        payout: demoPayout,
        win: demoWin,
        coins,
        serverSeedHash: '',
        clientSeed: '',
        nonce: 0,
      });
      setDemoMsg('Demo mode — no coins wagered');
      setShowResultCard(true);
      setDropping(false);
      return;
    }

    try {
      const res = await fetch('/api/games/plinko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betAmount, rows, risk }),
      });
      if (!res.ok) {
        const err = await res.json() as { error: string };
        setMsg(err.error === 'Insufficient coins' ? 'Insufficient coins' : err.error || 'Drop failed');
        setDropping(false);
        return;
      }
      const data: DropResult = await res.json();
      updateCoins(data.coins);

      playDropStart();
      await animateDrop(data.paths);
      playLanding(data.multiplier);
      setResult(data);
      setShowResultCard(true);
      setDropping(false);

      const entry: HistoryEntry = {
        multiplier: data.multiplier,
        payout: data.payout,
        win: data.win,
        rows: data.rows,
        risk: data.risk,
        timestamp: Date.now(),
      };
      const newHistory = [entry, ...history].slice(0, 50);
      setHistory(newHistory);
      const total = newHistory.length;
      const wins = newHistory.filter(x => x.win).length;
      const bestMult = Math.max(...newHistory.map(x => x.multiplier));
      setStats({ total, wins, bestMult });
      localStorage.setItem('plinko_history', JSON.stringify(newHistory));
    } catch {
      setMsg('Network error');
      setDropping(false);
    }
  };

  const animateDrop = (paths: boolean[]): Promise<void> => {
    return new Promise((resolve) => {
      pathRef.current = paths;
      const steps = paths.length;
      const finalSlot = paths.filter(Boolean).length;
      const segments = computeTrajectory(paths);
      const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
      const startTime = performance.now();
      let passedPegs = 0;

      setBallPos({ x: BOARD_W / 2, y: TOP_PAD - 15 });

      function tick(now: number) {
        const elapsed = now - startTime;

        if (elapsed >= totalDuration) {
          const last = segments[segments.length - 1];
          setBallPos({ x: last.p2.x, y: last.p2.y });
          setLandingGlow(true);
          resolve();
          return;
        }

        let t = elapsed;
        let segIdx = 0;
        for (let i = 0; i < segments.length; i++) {
          if (t <= segments[i].duration) {
            segIdx = i;
            break;
          }
          t -= segments[i].duration;
        }
        if (segIdx >= segments.length) {
          segIdx = segments.length - 1;
          t = segments[segIdx].duration;
        }

        const seg = segments[segIdx];
        const progress = Math.min(1, Math.max(0, t / seg.duration));
        const eased = 1 - (1 - progress) * (1 - progress);
        const x = quadraticBezier(eased, seg.p0.x, seg.p1.x, seg.p2.x);
        const y = quadraticBezier(eased, seg.p0.y, seg.p1.y, seg.p2.y);
        setBallPos({ x, y });

        while (passedPegs < segIdx && passedPegs < steps) {
          playPegHit();
          const pinIdx = paths.slice(0, passedPegs).filter(Boolean).length;
          setHitPins(prev => new Set(prev).add(`${passedPegs}-${pinIdx}`));
          passedPegs++;
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    });
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const quickBet = (n: number) => setBetAmount(prev => {
    const nv = prev + n;
    if (nv < 1) return 1;
    return nv;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-100px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30 flex items-center justify-center shadow-lg shadow-pink-500/20 p-2">
            <img src="/plinko-removebg-preview.png" alt="Plinko" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Plinko</h1>
            <p className="text-xs text-slate-500">Drop the ball, hit multipliers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(440px,1fr)_240px] gap-5">
          {/* LEFT CONTROLS */}
          <div className="space-y-3.5" ref={controlsRef}>
            {/* Bet Amount */}
            <div className="glass rounded-2xl p-4">
              <label className="text-xs font-medium text-slate-400 mb-2.5 block">Bet Amount</label>
              <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden">
                <button
                  onClick={() => quickBet(-10)}
                  className="w-11 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center justify-center border-x border-slate-700/40 h-10">
                  <span className="text-lg font-bold text-white tabular-nums">{betAmount}</span>
                </div>
                <button
                  onClick={() => quickBet(10)}
                  className="w-11 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1.5 mt-2.5">
                {[1, 2, 5, 10].map(m => (
                  <button
                    key={m}
                    onClick={() => setBetAmount(p => { const v = p * m; return v < 1 ? 1 : v; })}
                    className="flex-1 h-8 text-xs font-semibold rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                  >{m}x</button>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="glass rounded-2xl p-4">
              <label className="text-xs font-medium text-slate-400 mb-2.5 block">Rows</label>
              <div className="flex gap-2">
                {VALID_ROWS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRows(r)}
                    className={`flex-1 h-10 text-sm font-bold rounded-xl transition-all ${rows === r ? 'bg-pink-500/20 text-pink-400 border-2 border-pink-500/40 shadow-sm shadow-pink-500/10' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700 hover:text-slate-200'}`}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div className="glass rounded-2xl p-4">
              <label className="text-xs font-medium text-slate-400 mb-2.5 block">Risk</label>
              <div className="flex gap-2">
                {VALID_RISKS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    className={`flex-1 h-10 text-xs font-bold rounded-xl transition-all ${risk === r ? 'bg-pink-500/20 text-pink-400 border-2 border-pink-500/40 shadow-sm shadow-pink-500/10' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700 hover:text-slate-200'}`}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Drop button */}
            <button
              onClick={doDrop}
              disabled={dropping}
              className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${dropping ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500 hover:shadow-lg hover:shadow-pink-500/25 active:scale-[0.97]'}`}
            >
              {dropping ? 'Dropping...' : 'Drop Ball'}
            </button>
          </div>

          {/* CENTER: PLINKO BOARD */}
          <div className="flex items-center justify-center" ref={gameAreaRef}>
            <div
              ref={boardRef}
              className="relative rounded-2xl bg-slate-900/90 border border-slate-700/30 overflow-hidden select-none shadow-xl shadow-black/20"
              style={{
                width: BOARD_W,
                height: boardHeight,
              }}
            >
              {/* Pins */}
              {Array.from({ length: rows }, (_, row) => {
                const pinCount = row + 1;
                return Array.from({ length: pinCount }, (_, idx) => {
                  const pos = getPinPos(row, idx);
                  const isHit = hitPins.has(`${row}-${idx}`);
                  return (
                    <div
                      key={`pin-${row}-${idx}`}
                      className={`absolute rounded-full transition-all duration-200 ${isHit ? 'scale-125' : ''}`}
                      style={{
                        width: PIN_R * 2,
                        height: PIN_R * 2,
                        left: BOARD_W / 2 + pos.x - PIN_R,
                        top: pos.y - PIN_R,
                        background: isHit
                          ? 'radial-gradient(circle, rgba(255,255,255,0.6), rgba(168,85,247,0.3))'
                          : 'radial-gradient(circle, rgba(148,163,184,0.4), rgba(71,85,105,0.3))',
                        boxShadow: isHit
                          ? '0 0 8px rgba(168,85,247,0.4), 0 0 2px rgba(255,255,255,0.2)'
                          : 'inset 0 1px 2px rgba(255,255,255,0.08)',
                      }}
                    />
                  );
                });
              })}

              {/* Slots */}
              {Array.from({ length: rows + 1 }, (_, slot) => {
                const mult = multipliers[slot];
                const cx = getSlotCenterX(slot);
                const slotW = PIN_SPACING * 0.85;
                const maxH = SLOT_H;
                const pct = maxSlotMult > minSlotMult
                  ? ((mult - minSlotMult) / (maxSlotMult - minSlotMult))
                  : 0.5;
                const h = maxH * (0.35 + 0.65 * pct);
                const color = getSlotColor(mult);
                const bg = bgAlpha(mult);
                const isHitSlot = result && showResultCard && result.slot === slot;
                return (
                  <div key={`slot-${slot}`} className="absolute" style={{
                    left: BOARD_W / 2 + cx - slotW / 2,
                    bottom: 6,
                    width: slotW,
                  }}>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className={`text-[10px] font-bold transition-all duration-300 ${isHitSlot ? 'scale-125' : ''}`} style={{ color }}>{mult}x</div>
                      <div
                        className={`w-full rounded-sm transition-all duration-300 ${isHitSlot ? 'shadow-lg' : ''}`}
                        style={{
                          height: Math.max(h, 8),
                          background: `linear-gradient(to top, ${color}55, ${bg})`,
                          border: `1px solid ${color}44`,
                          borderRadius: '2px 2px 0 0',
                          boxShadow: isHitSlot ? `0 0 16px ${color}66, 0 0 4px ${color}44` : 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Ball */}
              {ballPos && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    width: BALL_R * 2,
                    height: BALL_R * 2,
                    left: 0,
                    top: 0,
                    transform: `translate3d(${ballPos.x - BALL_R}px, ${ballPos.y - BALL_R}px, 0)`,
                    willChange: 'transform',
                  }}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/50 relative">
                    <div className="absolute inset-1 rounded-full bg-white/15" />
                    <div className="absolute inset-0 rounded-full shadow-inner shadow-white/20" />
                  </div>
                </div>
              )}

              {/* Landing glow */}
              {landingGlow && result && (
                <>
                  <div
                    className="absolute w-8 h-8 rounded-full animate-ping pointer-events-none"
                    style={{
                      left: BOARD_W / 2 + getSlotCenterX(result.slot) - 16,
                      bottom: SLOT_H + 6,
                      backgroundColor: getSlotColor(result.multiplier),
                      opacity: 0.25,
                    }}
                  />
                  <div
                    className="absolute w-5 h-5 rounded-full animate-pulse pointer-events-none"
                    style={{
                      left: BOARD_W / 2 + getSlotCenterX(result.slot) - 10,
                      bottom: SLOT_H + 10,
                      backgroundColor: getSlotColor(result.multiplier),
                      opacity: 0.15,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="space-y-3.5">
            {/* Result card */}
            {showResultCard && result && (
              <div className="glass rounded-2xl p-4 text-center">
                <div className="text-xs text-slate-500 mb-1.5">
                  {result.rows} rows &middot; {result.risk}
                </div>
                <div
                  className="text-3xl font-black mb-1 transition-all duration-300"
                  style={{ color: getSlotColor(result.multiplier) }}
                >
                  {result.multiplier}x
                </div>
                <div className={`text-sm font-semibold ${result.win ? 'text-green-400' : 'text-red-400'}`}>
                  {result.win ? 'You won!' : 'Better luck next time'}
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {formatCoins(result.payout)} coins
                </div>
                {demoMsg && <p className="text-[10px] text-yellow-600 mt-2">{demoMsg}</p>}
              </div>
            )}

            {/* Message */}
            {msg && (
              <div className="glass rounded-2xl p-3 text-center">
                <p className="text-sm text-red-400">{msg}</p>
              </div>
            )}

            {/* Stats */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Stats</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{stats.total}</div>
                  <div className="text-[10px] text-slate-500">Drops</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{stats.total > 0 ? Math.round(stats.wins / stats.total * 100) : 0}%</div>
                  <div className="text-[10px] text-slate-500">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{stats.bestMult}x</div>
                  <div className="text-[10px] text-slate-500">Best Mult</div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">History</h3>
                {history.length > 0 && (
                  <button
                    onClick={() => { setHistory([]); setStats({ total: 0, wins: 0, bestMult: 0 }); localStorage.removeItem('plinko_history'); }}
                    className="text-[10px] text-slate-600 hover:text-red-400 transition-colors"
                  >Clear</button>
                )}
              </div>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {history.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-3">No drops yet</p>
                )}
                {history.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${entry.win ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-slate-400">{entry.rows}r</span>
                      <span className="text-slate-500">{entry.risk}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: getSlotColor(entry.multiplier) }}>{entry.multiplier}x</span>
                      <span className={`${entry.win ? 'text-green-400' : 'text-red-400'}`}>{entry.win ? `+${formatCoins(entry.payout)}` : `${formatCoins(entry.payout)}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

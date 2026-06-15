import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';
import { getPlinkoPaths, getPlinkoMultiplier } from '@/lib/fairness';

const VALID_ROWS = [8, 12, 16] as const;
const VALID_RISKS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { betAmount, rows, risk } = await req.json() as { betAmount: number; rows: 8 | 12 | 16; risk: 'LOW' | 'MEDIUM' | 'HIGH' };

    if (!betAmount || betAmount < 1) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    }
    if (!VALID_ROWS.includes(rows)) {
      return NextResponse.json({ error: 'Invalid rows' }, { status: 400 });
    }
    if (!VALID_RISKS.includes(risk)) {
      return NextResponse.json({ error: 'Invalid risk' }, { status: 400 });
    }

    const user = await executeOne(
      'SELECT id, coins FROM User WHERE id = ?',
      [session.user.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.coins < betAmount) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
    }

    const seed = await executeOne(
      'SELECT id, serverSeed, serverSeedHash, clientSeed, nonce FROM ProvablyFairSeed WHERE userId = ? AND active = 1',
      [session.user.id]
    );

    if (!seed) {
      return NextResponse.json({ error: 'No active seed found' }, { status: 400 });
    }

    const nonce = seed.nonce;
    const paths = getPlinkoPaths(seed.serverSeed, seed.clientSeed, nonce, rows);
    const slot = paths.filter(Boolean).length;
    const multiplier = getPlinkoMultiplier(slot, rows, risk);
    const payout = betAmount * multiplier;
    const win = payout >= betAmount;

    const newCoins = user.coins + payout - betAmount;
    const xpGain = Math.floor(betAmount * 10);

    // Update user
    await executeRun(
      'UPDATE User SET coins = ?, xp = xp + ? WHERE id = ?',
      [newCoins, xpGain, session.user.id]
    );

    // Increment nonce
    await executeRun(
      'UPDATE ProvablyFairSeed SET nonce = nonce + 1 WHERE id = ?',
      [seed.id]
    );

    // Create game session
    let gameId: string;
    try {
      gameId = crypto.randomUUID();
    } catch (e) {
      gameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    await executeRun(
      `INSERT INTO GameSession (id, userId, gameType, betAmount, status, serverSeed, clientSeed, nonce, details, createdAt, expiresAt)
       VALUES (?, ?, 'PLINKO', ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
      [
        gameId,
        session.user.id,
        betAmount,
        win ? 'WON' : 'LOST',
        seed.serverSeed,
        seed.clientSeed,
        nonce,
        JSON.stringify({ paths, slot, rows, risk, multiplier }),
        new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      ]
    );

    // Record game history
    let historyId: string;
    try {
      historyId = crypto.randomUUID();
    } catch (e) {
      historyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    await executeRun(
      `INSERT INTO GameHistory (id, userId, gameType, betAmount, payout, multiplier, win, serverSeed, clientSeed, nonce, createdAt)
       VALUES (?, ?, 'PLINKO', ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [historyId, session.user.id, betAmount, payout, multiplier, win ? 1 : 0, seed.serverSeedHash, seed.clientSeed, nonce]
    );

    return NextResponse.json({
      gameId,
      paths,
      slot,
      rows,
      risk,
      multiplier,
      payout,
      win,
      serverSeedHash: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
      coins: newCoins,
    });
  } catch (error) {
    console.error('[Plinko] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function PUT() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function DELETE() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

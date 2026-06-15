import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';
import { getCoinResult } from '@/lib/fairness';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { betAmount, choice } = await req.json() as { betAmount: number; choice: 'heads' | 'tails' };

    if (!betAmount || betAmount < 1) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    }
    if (choice !== 'heads' && choice !== 'tails') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
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
    const isHeads = getCoinResult(seed.serverSeed, seed.clientSeed, nonce);
    const result = isHeads ? 'heads' : 'tails';
    const win = result === choice;
    const multiplier = 1.98;
    const payout = win ? betAmount * multiplier : 0;

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
       VALUES (?, ?, 'COINFLIP', ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
      [
        gameId,
        session.user.id,
        betAmount,
        win ? 'WON' : 'LOST',
        seed.serverSeed,
        seed.clientSeed,
        nonce,
        JSON.stringify({ result, choice }),
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
       VALUES (?, ?, 'COINFLIP', ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [historyId, session.user.id, betAmount, payout, win ? multiplier : 0, win ? 1 : 0, seed.serverSeedHash, seed.clientSeed, nonce]
    );

    return NextResponse.json({
      gameId,
      result,
      choice,
      win,
      payout,
      multiplier: win ? multiplier : 0,
      serverSeedHash: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
      coins: newCoins,
    });
  } catch (error) {
    console.error('[Coinflip] Error:', error);
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

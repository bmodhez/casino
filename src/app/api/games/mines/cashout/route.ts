import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';
import { calculateMinesMultiplier } from '@/lib/fairness';

// Cashout from mines game
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await req.json() as { gameId: string };
    if (!gameId) {
      return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
    }

    const game = await executeOne(
      'SELECT id, userId, mineCount, betAmount, gemsRevealed, status, expiresAt, serverSeed, clientSeed, nonce FROM GameSession WHERE id = ?',
      [gameId]
    );

    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }

    // Check expiration
    const expiresAt = new Date(game.expiresAt);
    if (expiresAt < new Date()) {
      await executeRun('UPDATE GameSession SET status = ? WHERE id = ?', ['EXPIRED', gameId]);
      return NextResponse.json({ error: 'Game expired' }, { status: 400 });
    }

    if (game.gemsRevealed < 1) {
      return NextResponse.json({ error: 'Reveal at least one gem first' }, { status: 400 });
    }

    if (!game.mineCount) {
      return NextResponse.json({ error: 'Invalid game state' }, { status: 400 });
    }

    const mineCount = game.mineCount;
    const multiplier = calculateMinesMultiplier(mineCount, game.gemsRevealed);
    const payout = game.betAmount * multiplier;
    const xpGain = Math.floor(game.betAmount * 10);

    // Update user coins and XP
    await executeRun(
      'UPDATE User SET coins = coins + ?, xp = xp + ? WHERE id = ?',
      [payout, xpGain, game.userId]
    );

    // Create game history
    let historyId: string;
    try {
      historyId = crypto.randomUUID();
    } catch (e) {
      historyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    await executeRun(
      `INSERT INTO GameHistory (id, userId, gameType, betAmount, payout, multiplier, win, mineCount, serverSeed, clientSeed, nonce, createdAt)
       VALUES (?, ?, 'MINES', ?, ?, ?, 1, ?, ?, ?, ?, datetime('now'))`,
      [historyId, game.userId, game.betAmount, payout, multiplier, mineCount, game.serverSeed, game.clientSeed, game.nonce]
    );

    // Update game session to WON
    await executeRun('UPDATE GameSession SET status = ? WHERE id = ?', ['WON', gameId]);

    // Get updated user coins
    const user = await executeOne('SELECT coins FROM User WHERE id = ?', [game.userId]);

    return NextResponse.json({
      result: 'cashout',
      payout,
      multiplier,
      gemsRevealed: game.gemsRevealed,
      coins: user?.coins || 0,
    });
  } catch (error) {
    console.error('[Mines Cashout] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function POST() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function DELETE() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

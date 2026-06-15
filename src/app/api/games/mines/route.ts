import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';
import { getMinePositions, calculateMinesMultiplier } from '@/lib/fairness';

// Start a new mines game
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { betAmount, mineCount } = await req.json() as { betAmount: number; mineCount: number };

    if (!betAmount || betAmount < 1 || mineCount < 1 || mineCount > 24) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Get user and active seed
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

    // Get active seed
    const seed = await executeOne(
      'SELECT id, serverSeed, serverSeedHash, clientSeed, nonce FROM ProvablyFairSeed WHERE userId = ? AND active = 1',
      [session.user.id]
    );

    if (!seed) {
      return NextResponse.json({ error: 'No active seed found' }, { status: 400 });
    }

    const nonce = seed.nonce;
    const minePositions = getMinePositions(seed.serverSeed, seed.clientSeed, nonce, mineCount);

    // Create game session
    let gameId: string;
    try {
      gameId = crypto.randomUUID();
    } catch (e) {
      gameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await executeRun(
      `INSERT INTO GameSession (id, userId, gameType, mineCount, betAmount, minePositions, status, serverSeed, clientSeed, nonce, createdAt, expiresAt)
       VALUES (?, ?, 'MINES', ?, ?, ?, 'ACTIVE', ?, ?, ?, datetime('now'), ?)`,
      [gameId, session.user.id, mineCount, betAmount, JSON.stringify(minePositions), seed.serverSeed, seed.clientSeed, nonce, expiresAt]
    );

    // Deduct bet amount and increment nonce
    await executeRun(
      'UPDATE User SET coins = coins - ? WHERE id = ?',
      [betAmount, session.user.id]
    );

    await executeRun(
      'UPDATE ProvablyFairSeed SET nonce = nonce + 1 WHERE id = ?',
      [seed.id]
    );

    return NextResponse.json({
      gameId,
      coins: user.coins - betAmount,
      serverSeedHash: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
    });
  } catch (error) {
    console.error('[Mines Start] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Reveal a tile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, position } = await req.json() as { gameId: string; position: number };

    if (!gameId || position === undefined || position < 0 || position > 24) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const game = await executeOne(
      'SELECT id, userId, mineCount, betAmount, minePositions, gemsRevealed, status, serverSeed, clientSeed, nonce FROM GameSession WHERE id = ?',
      [gameId]
    );

    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }

    const minePositions = JSON.parse(game.minePositions) as number[];
    const isMine = minePositions.includes(position);

    if (isMine) {
      // Hit a mine - game over
      await executeRun(
        'UPDATE GameSession SET status = ?, gemsRevealed = ? WHERE id = ?',
        ['LOST', game.gemsRevealed + 1, gameId]
      );

      // Record game history
      let historyId: string;
      try {
        historyId = crypto.randomUUID();
      } catch (e) {
        historyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      await executeRun(
        `INSERT INTO GameHistory (id, userId, gameType, betAmount, payout, multiplier, win, mineCount, serverSeed, clientSeed, nonce, createdAt)
         VALUES (?, ?, 'MINES', ?, 0, 0, 0, ?, ?, ?, ?, datetime('now'))`,
        [historyId, session.user.id, game.betAmount, game.mineCount, game.serverSeed, game.clientSeed, game.nonce]
      );

      return NextResponse.json({
        result: 'mine',
        position,
        minePositions,
        gemsRevealed: game.gemsRevealed + 1,
        multiplier: 0,
        coins: (await executeOne('SELECT coins FROM User WHERE id = ?', [session.user.id]))?.coins || 0,
      });
    } else {
      // Revealed a gem
      const newGemsRevealed = game.gemsRevealed + 1;
      const multiplier = calculateMinesMultiplier(game.mineCount, newGemsRevealed);

      await executeRun(
        'UPDATE GameSession SET gemsRevealed = ? WHERE id = ?',
        [newGemsRevealed, gameId]
      );

      return NextResponse.json({
        result: 'safe',
        position,
        gemsRevealed: newGemsRevealed,
        multiplier,
      });
    }
  } catch (error) {
    console.error('[Mines Reveal] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Cash out
export async function DELETE(req: NextRequest) {
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
      'SELECT id, userId, mineCount, betAmount, minePositions, gemsRevealed, status, serverSeed, clientSeed, nonce FROM GameSession WHERE id = ?',
      [gameId]
    );

    if (!game || game.userId !== session.user.id) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }

    const multiplier = calculateMinesMultiplier(game.mineCount, game.gemsRevealed);
    const payout = game.betAmount * multiplier;

    // Update game status and user coins
    await executeRun(
      'UPDATE GameSession SET status = ? WHERE id = ?',
      ['CASHED_OUT', gameId]
    );

    await executeRun(
      'UPDATE User SET coins = coins + ? WHERE id = ?',
      [payout, session.user.id]
    );

    // Record game history
    let historyId: string;
    try {
      historyId = crypto.randomUUID();
    } catch (e) {
      historyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    await executeRun(
      `INSERT INTO GameHistory (id, userId, gameType, betAmount, payout, multiplier, win, mineCount, serverSeed, clientSeed, nonce, createdAt)
       VALUES (?, ?, 'MINES', ?, ?, ?, 1, ?, ?, ?, ?, datetime('now'))`,
      [historyId, session.user.id, game.betAmount, payout, multiplier, game.mineCount, game.serverSeed, game.clientSeed, game.nonce]
    );

    const minePositions = JSON.parse(game.minePositions) as number[];

    return NextResponse.json({
      result: 'cashout',
      payout,
      multiplier,
      gemsRevealed: game.gemsRevealed,
      minePositions,
      coins: (await executeOne('SELECT coins FROM User WHERE id = ?', [session.user.id]))?.coins || 0,
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

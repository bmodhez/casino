import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';
import { calculateMinesMultiplier } from '@/lib/fairness';

// Reveal a tile in mines game
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
    console.error('[Mines Click] Error:', error);
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

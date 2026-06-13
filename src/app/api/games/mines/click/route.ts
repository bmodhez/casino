import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateMinesMultiplier } from '@/lib/fairness';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { gameId, cellIndex } = await req.json();
  if (!gameId || typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex >= 25) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const game = await prisma.gameSession.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  if (game.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
  }

  if (game.expiresAt < new Date()) {
    await prisma.gameSession.update({ where: { id: gameId }, data: { status: 'EXPIRED' } });
    return NextResponse.json({ error: 'Game expired' }, { status: 400 });
  }

  if (!game.minePositions || game.mineCount == null) {
    return NextResponse.json({ error: 'Invalid game state' }, { status: 400 });
  }
  const minePositions = game.minePositions as number[];
  const mineCount = game.mineCount;
  const isMine = minePositions.includes(cellIndex);

  if (isMine) {
    await prisma.$transaction([
      prisma.gameHistory.create({
        data: {
          userId: game.userId,
          gameType: 'MINES',
          mineCount,
          betAmount: game.betAmount,
          payout: 0,
          multiplier: 1,
          win: false,
          serverSeed: game.serverSeed,
          clientSeed: game.clientSeed,
          nonce: game.nonce,
        },
      }),
      prisma.gameSession.update({
        where: { id: gameId },
        data: { status: 'LOST' },
      }),
    ]);

    return NextResponse.json({ result: 'mine', minePositions });
  }

  const newGems = game.gemsRevealed + 1;
  const multiplier = calculateMinesMultiplier(mineCount, newGems);
  const safeCells = 25 - mineCount;

  await prisma.gameSession.update({
    where: { id: gameId },
    data: { gemsRevealed: newGems },
  });

  if (newGems >= safeCells) {
    const payout = game.betAmount * multiplier;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: game.userId },
        data: {
          coins: { increment: payout },
          xp: { increment: Math.floor(game.betAmount * 10) },
        },
      }),
      prisma.gameHistory.create({
        data: {
          userId: game.userId,
          gameType: 'MINES',
          mineCount,
          betAmount: game.betAmount,
          payout,
          multiplier,
          win: true,
          serverSeed: game.serverSeed,
          clientSeed: game.clientSeed,
          nonce: game.nonce,
        },
      }),
      prisma.gameSession.update({
        where: { id: gameId },
        data: { status: 'WON', gemsRevealed: newGems },
      }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: game.userId } });

    return NextResponse.json({
      result: 'cashout',
      payout,
      multiplier,
      gemsRevealed: newGems,
      coins: user?.coins || 0,
    });
  }

  return NextResponse.json({ result: 'gem', multiplier, gemsRevealed: newGems });
}

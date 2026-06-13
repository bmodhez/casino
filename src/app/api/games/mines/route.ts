import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMinePositions } from '@/lib/fairness';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { betAmount, mineCount } = await req.json();

  if (!betAmount || betAmount < 1 || mineCount < 1 || mineCount > 24) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { seeds: { where: { active: true }, take: 1 } },
  });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.coins < betAmount) return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
  if (!user.seeds[0]) return NextResponse.json({ error: 'No seed found' }, { status: 400 });

  const seed = user.seeds[0];
  const nonce = seed.nonce;
  const minePositions = getMinePositions(seed.serverSeed, seed.clientSeed, nonce, mineCount);

  const [, , game] = await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { coins: { decrement: betAmount } } }),
    prisma.provablyFairSeed.update({ where: { id: seed.id }, data: { nonce: { increment: 1 } } }),
    prisma.gameSession.create({
      data: {
        userId: user.id,
        gameType: 'MINES',
        mineCount,
        betAmount,
        minePositions,
        status: 'ACTIVE',
        serverSeed: seed.serverSeed,
        clientSeed: seed.clientSeed,
        nonce,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    }),
  ]);

  return NextResponse.json({
    gameId: game.id,
    minePositions,
    serverSeedHash: seed.serverSeedHash,
    clientSeed: seed.clientSeed,
    nonce,
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { gameId } = await req.json();
  if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

  const game = await prisma.gameSession.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  if (game.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
  }

  await prisma.gameSession.update({
    where: { id: gameId },
    data: { status: 'EXPIRED' },
  });

  return NextResponse.json({ result: 'cancelled' });
}

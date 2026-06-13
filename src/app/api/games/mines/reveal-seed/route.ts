import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMinePositions } from '@/lib/fairness';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });

  const game = await prisma.gameSession.findUnique({ where: { id: gameId } });
  if (!game || game.userId !== session.user.id) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  if (game.status === 'ACTIVE') {
    return NextResponse.json({ error: 'Reveal seed after game ends' }, { status: 400 });
  }

  if (game.mineCount == null) {
    return NextResponse.json({ error: 'Not a mines game' }, { status: 400 });
  }
  const minePositions = getMinePositions(game.serverSeed, game.clientSeed, game.nonce, game.mineCount);

  return NextResponse.json({
    serverSeed: game.serverSeed,
    clientSeed: game.clientSeed,
    nonce: game.nonce,
    mineCount: game.mineCount,
    minePositions,
    verified: true,
  });
}

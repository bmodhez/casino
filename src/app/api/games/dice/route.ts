import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:
import { getDiceRoll } from '@/lib/fairness';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { betAmount, target, overUnder } = await req.json();

  if (!betAmount || betAmount < 1) {
    return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
  }
  if (typeof target !== 'number' || target < 1 || target > 99) {
    return NextResponse.json({ error: 'Target must be between 1 and 99' }, { status: 400 });
  }
  if (overUnder !== 'over' && overUnder !== 'under') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
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
  const roll = getDiceRoll(seed.serverSeed, seed.clientSeed, nonce);

  const win = overUnder === 'over' ? roll > target : roll < target;
  const winChance = overUnder === 'over' ? 100 - target : target;
  const multiplier = parseFloat(((99 / winChance) * 0.99).toFixed(4));
  const payout = win ? betAmount * multiplier : 0;

  const [, , session_created] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: payout - betAmount },
        xp: { increment: Math.floor(betAmount * 10) },
      },
    }),
    prisma.provablyFairSeed.update({ where: { id: seed.id }, data: { nonce: { increment: 1 } } }),
    prisma.gameSession.create({
      data: {
        userId: user.id,
        gameType: 'DICE',
        betAmount,
        status: win ? 'WON' : 'LOST',
        serverSeed: seed.serverSeed,
        clientSeed: seed.clientSeed,
        nonce,
        details: { target, overUnder, roll, winChance },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    }),
  ]);

  await prisma.gameHistory.create({
    data: {
      userId: user.id,
      gameType: 'DICE',
      betAmount,
      payout,
      multiplier: win ? multiplier : 0,
      win,
      serverSeed: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
    },
  });

  return NextResponse.json({
    gameId: session_created.id,
    roll,
    target,
    overUnder,
    win,
    payout,
    multiplier: win ? multiplier : 0,
    winChance,
    serverSeedHash: seed.serverSeedHash,
    clientSeed: seed.clientSeed,
    nonce,
    coins: user.coins + payout - betAmount,
  });
}

*/

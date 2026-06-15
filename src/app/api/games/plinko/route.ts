import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:
import { getPlinkoPaths, getPlinkoMultiplier } from '@/lib/fairness';

const VALID_ROWS = [8, 12, 16] as const;
const VALID_RISKS = ['LOW', 'MEDIUM', 'HIGH'] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { betAmount, rows, risk } = await req.json();

  if (!betAmount || betAmount < 1) {
    return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
  }
  if (!VALID_ROWS.includes(rows)) {
    return NextResponse.json({ error: 'Invalid rows' }, { status: 400 });
  }
  if (!VALID_RISKS.includes(risk)) {
    return NextResponse.json({ error: 'Invalid risk' }, { status: 400 });
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
  const paths = getPlinkoPaths(seed.serverSeed, seed.clientSeed, nonce, rows);
  const slot = paths.filter(Boolean).length;
  const multiplier = getPlinkoMultiplier(slot, rows, risk);
  const payout = betAmount * multiplier;
  const win = payout >= betAmount;

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
        gameType: 'PLINKO',
        betAmount,
        status: win ? 'WON' : 'LOST',
        serverSeed: seed.serverSeed,
        clientSeed: seed.clientSeed,
        nonce,
        details: { paths, slot, rows, risk, multiplier },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    }),
  ]);

  await prisma.gameHistory.create({
    data: {
      userId: user.id,
      gameType: 'PLINKO',
      betAmount,
      payout,
      multiplier,
      win,
      serverSeed: seed.serverSeedHash,
      clientSeed: seed.clientSeed,
      nonce,
    },
  });

  return NextResponse.json({
    gameId: session_created.id,
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
    coins: user.coins + payout - betAmount,
  });
}

*/

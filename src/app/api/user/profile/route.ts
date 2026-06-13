import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, username: true, email: true, image: true,
      coins: true, xp: true, level: true,
      lastDailyClaimed: true, createdAt: true, role: true,
      gameHistory: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { gameType: true, betAmount: true, payout: true, win: true, multiplier: true, createdAt: true },
      },
      _count: { select: { gameHistory: true } },
    },
  });

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Calculate stats
  const wins = await prisma.gameHistory.count({ where: { userId: session.user.id, win: true } });
  
  const stats = await prisma.gameHistory.aggregate({
    where: { userId: session.user.id },
    _sum: {
      betAmount: true,
      payout: true,
    },
  });

  // Calculate user's rank based on coins
  const usersWithMoreCoins = await prisma.user.count({
    where: {
      coins: {
        gt: user.coins,
      },
      banned: false,
    },
  });
  
  const rank = usersWithMoreCoins + 1; // +1 because count gives users above, rank is position

  return NextResponse.json({
    username: user.username,
    email: user.email,
    coins: user.coins,
    xp: user.xp,
    level: user.level,
    createdAt: user.createdAt,
    totalGamesPlayed: user._count.gameHistory,
    totalWins: wins,
    totalWagered: stats._sum.betAmount || 0,
    totalPayout: stats._sum.payout || 0,
    rank: rank,
  });
}

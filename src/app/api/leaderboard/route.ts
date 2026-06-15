import { NextRequest, NextResponse } from 'next/server';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:
import { getCachedLeaderboard, setCachedLeaderboard } from '@/lib/leaderboard-cache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'all';

  // For "all" period, use weekly cache
  if (period === 'all') {
    const cached = getCachedLeaderboard();
    if (cached) return NextResponse.json(cached);
  }

  const where: any = { banned: false };

  if (period === 'weekly') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: weekAgo };
  } else if (period === 'monthly') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: monthAgo };
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      image: true,
      coins: true,
      level: true,
      xp: true,
      _count: { select: { gameHistory: true } },
    },
    orderBy: { coins: 'desc' },
    take: 100,
  });

  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const wins = await prisma.gameHistory.count({
        where: { userId: user.id, win: true },
      });
      return {
        ...user,
        totalGames: user._count.gameHistory,
        totalWins: wins,
        winRate: user._count.gameHistory > 0 ? Math.round((wins / user._count.gameHistory) * 100) : 0,
      };
    })
  );

  // Cache for "all" period
  if (period === 'all') {
    setCachedLeaderboard(leaderboard);
  }

  return NextResponse.json(leaderboard);
}

*/

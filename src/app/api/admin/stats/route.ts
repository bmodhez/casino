import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeAll } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all stats in parallel
    const [usersResult, coinsResult, gamesResult] = await executeAll([
      { sql: 'SELECT COUNT(*) as total, SUM(CASE WHEN banned = 0 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN banned = 1 THEN 1 ELSE 0 END) as banned FROM User', params: [] },
      { sql: 'SELECT SUM(coins) as totalCoins FROM User', params: [] },
      { sql: 'SELECT COUNT(*) as totalGames, SUM(betAmount) as totalWagered, SUM(payout) as totalPayout FROM GameHistory', params: [] },
    ]);

    const userStats = usersResult[0] || { total: 0, active: 0, banned: 0 };
    const coinStats = coinsResult[0] || { totalCoins: 0 };
    const gameStats = gamesResult[0] || { totalGames: 0, totalWagered: 0, totalPayout: 0 };

    return NextResponse.json({
      totalUsers: userStats.total || 0,
      activeUsers: userStats.active || 0,
      bannedUsers: userStats.banned || 0,
      totalCoinsInCirculation: coinStats.totalCoins || 0,
      totalGamesPlayed: gameStats.totalGames || 0,
      totalWagered: gameStats.totalWagered || 0,
      totalPayout: gameStats.totalPayout || 0,
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Single optimized query to get all stats at once
    const statsResult = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM User) as totalUsers,
        (SELECT COUNT(*) FROM User WHERE banned = 0) as activeUsers,
        (SELECT COUNT(*) FROM User WHERE banned = 1) as bannedUsers,
        (SELECT COALESCE(SUM(coins), 0) FROM User) as totalCoinsInCirculation,
        (SELECT COUNT(*) FROM GameHistory) as totalGamesPlayed,
        (SELECT COALESCE(SUM(betAmount), 0) FROM GameHistory) as totalWagered,
        (SELECT COALESCE(SUM(payout), 0) FROM GameHistory) as totalPayout
    `, []);

    const stats = statsResult.results?.[0] || {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      totalCoinsInCirculation: 0,
      totalGamesPlayed: 0,
      totalWagered: 0,
      totalPayout: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

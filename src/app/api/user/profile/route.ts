import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeQuery } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const user = await executeOne(
      `SELECT id, username, email, image, coins, xp, level, lastDailyClaimed, createdAt, role, banned
       FROM User WHERE id = ?`,
      [session.user.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Count total games
    const gamesCount = await executeOne(
      'SELECT COUNT(*) as count FROM GameHistory WHERE userId = ?',
      [session.user.id]
    );

    // Count wins
    const winsCount = await executeOne(
      'SELECT COUNT(*) as count FROM GameHistory WHERE userId = ? AND win = 1',
      [session.user.id]
    );

    // Calculate total wagered and payout
    const stats = await executeOne(
      `SELECT 
        COALESCE(SUM(betAmount), 0) as totalWagered,
        COALESCE(SUM(payout), 0) as totalPayout
       FROM GameHistory WHERE userId = ?`,
      [session.user.id]
    );

    // Calculate user's rank based on coins
    const rankQuery = await executeOne(
      `SELECT COUNT(*) as count 
       FROM User 
       WHERE coins > ? AND banned = 0`,
      [user.coins]
    );

    const rank = (rankQuery?.count || 0) + 1;

    return NextResponse.json({
      username: user.username,
      email: user.email,
      coins: user.coins,
      xp: user.xp,
      level: user.level,
      createdAt: user.createdAt,
      totalGamesPlayed: gamesCount?.count || 0,
      totalWins: winsCount?.count || 0,
      totalWagered: stats?.totalWagered || 0,
      totalPayout: stats?.totalPayout || 0,
      rank: rank,
    });
  } catch (error: any) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function PUT() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function DELETE() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

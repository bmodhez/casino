import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/d1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';

    let whereClause = 'WHERE banned = 0';
    
    if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      whereClause += ` AND createdAt >= '${weekAgo.toISOString()}'`;
    } else if (period === 'monthly') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      whereClause += ` AND createdAt >= '${monthAgo.toISOString()}'`;
    }

    // Get top users with their game counts
    const usersResult = await executeQuery(
      `SELECT 
        u.id, u.username, u.image, u.coins, u.level, u.xp,
        COUNT(DISTINCT gh.id) as totalGames,
        SUM(CASE WHEN gh.win = 1 THEN 1 ELSE 0 END) as totalWins
       FROM User u
       LEFT JOIN GameHistory gh ON u.id = gh.userId
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.coins DESC
       LIMIT 100`
    );

    const users = usersResult?.results || [];
    
    const leaderboard = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      image: user.image,
      coins: user.coins,
      level: user.level,
      xp: user.xp,
      totalGames: user.totalGames || 0,
      totalWins: user.totalWins || 0,
      winRate: user.totalGames > 0 ? Math.round(((user.totalWins || 0) / user.totalGames) * 100) : 0,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
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

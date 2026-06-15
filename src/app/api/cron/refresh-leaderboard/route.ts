import { NextRequest, NextResponse } from 'next/server';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:

// This endpoint will be called by Cron at 12:00 AM IST (6:30 PM UTC previous day)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top users by coins
    const topUsers = await prisma.user.findMany({
      take: 100,
      orderBy: { coins: 'desc' },
      select: {
        id: true,
        username: true,
        image: true,
        coins: true,
        level: true,
        xp: true,
        gameHistory: {
          select: {
            win: true,
          },
        },
      },
    });

    // Calculate stats from game history
    const leaderboardData = topUsers.map((user) => {
      const totalGames = user.gameHistory.length;
      const totalWins = user.gameHistory.filter((game) => game.win).length;
      const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

      return {
        id: user.id,
        username: user.username,
        image: user.image,
        coins: user.coins,
        level: user.level,
        xp: user.xp,
        totalGames,
        totalWins,
        winRate,
      };
    });

    // Save to cache file
    const fs = require('fs');
    const path = require('path');
    const cacheFile = path.join(process.cwd(), '.leaderboard-cache.json');
    
    fs.writeFileSync(cacheFile, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      data: leaderboardData,
    }, null, 2));

    console.log(`[CRON] Leaderboard refreshed at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Leaderboard refreshed successfully',
      count: leaderboardData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Leaderboard refresh failed:', error);
    return NextResponse.json(
      { error: 'Failed to refresh leaderboard' },
      { status: 500 }
    );
  }
}

*/

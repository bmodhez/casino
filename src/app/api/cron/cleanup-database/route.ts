import { NextRequest, NextResponse } from 'next/server';
import { executeRun } from '@/lib/d1';

// ⚠️ MANUAL CLEANUP ONLY - AUTO-CLEANUP DISABLED
// This endpoint will NOT run automatically
// Call manually when you want to cleanup database
export async function GET(req: NextRequest) {
  try {
    // Verify this is being called from Cloudflare Cron (security)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[DB Cleanup] Starting database cleanup...');

    // 1. Delete game history older than 30 days
    const cleanupHistory = await executeRun(
      "DELETE FROM GameHistory WHERE createdAt < datetime('now', '-30 days')",
      []
    );
    console.log('[DB Cleanup] Deleted old game history:', cleanupHistory);

    // 2. Delete inactive users (no login in 90 days, 0 coins, not admin)
    const cleanupUsers = await executeRun(
      "DELETE FROM User WHERE lastLogin < datetime('now', '-90 days') AND coins = 0 AND role = 'USER'",
      []
    );
    console.log('[DB Cleanup] Deleted inactive users:', cleanupUsers);

    // 3. Delete orphaned achievements
    const cleanupAchievements = await executeRun(
      'DELETE FROM Achievement WHERE userId NOT IN (SELECT id FROM User)',
      []
    );
    console.log('[DB Cleanup] Deleted orphaned achievements:', cleanupAchievements);

    // 4. Delete orphaned daily rewards
    const cleanupRewards = await executeRun(
      'DELETE FROM DailyReward WHERE userId NOT IN (SELECT id FROM User)',
      []
    );
    console.log('[DB Cleanup] Deleted orphaned rewards:', cleanupRewards);

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      deleted: {
        gameHistory: cleanupHistory.meta?.changes || 0,
        users: cleanupUsers.meta?.changes || 0,
        achievements: cleanupAchievements.meta?.changes || 0,
        rewards: cleanupRewards.meta?.changes || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DB Cleanup] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database cleanup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

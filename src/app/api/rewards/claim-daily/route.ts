import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';

// Repeating 7-day reward cycle
const DAILY_REWARDS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 35,
  4: 45,
  5: 55,
  6: 65,
  7: 100,
};

// Get reward for any day (cycles every 7 days)
function getRewardForDay(dayNumber: number): number {
  const cycleDay = ((dayNumber - 1) % 7) + 1;
  return DAILY_REWARDS[cycleDay] || 10;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error('[Claim Daily] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Claim Daily] User ID:', session.user.id);

    const { day } = await req.json() as { day: number };
    console.log('[Claim Daily] Requested day:', day);

    if (!day || day < 1) {
      console.error('[Claim Daily] Invalid day:', day);
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const user = await executeOne(
      'SELECT id, coins, lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

    console.log('[Claim Daily] User found:', !!user);
    console.log('[Claim Daily] User coins:', user?.coins);
    console.log('[Claim Daily] Last claimed:', user?.lastDailyClaimed);

    if (!user) {
      console.error('[Claim Daily] User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('[Claim Daily] Today date:', today.toISOString());

    // Check if already claimed today
    if (user.lastDailyClaimed) {
      const lastClaimed = new Date(user.lastDailyClaimed);
      lastClaimed.setHours(0, 0, 0, 0);
      console.log('[Claim Daily] Last claimed date:', lastClaimed.toISOString());
      
      if (lastClaimed.getTime() === today.getTime()) {
        console.log('[Claim Daily] Already claimed today');
        return NextResponse.json({ error: 'Already claimed today' }, { status: 400 });
      }
    }

    // Get total streak count (all time)
    const streakCount = await executeOne(
      'SELECT COUNT(*) as count FROM DailyStreak WHERE userId = ?',
      [session.user.id]
    );

    const currentStreak = streakCount?.count || 0;
    const nextDay = currentStreak + 1;

    console.log('[Claim Daily] Current streak:', currentStreak);
    console.log('[Claim Daily] Next day should be:', nextDay);
    console.log('[Claim Daily] User requesting day:', day);

    // Validate user is claiming the correct next day
    if (day !== nextDay) {
      console.error('[Claim Daily] Day mismatch - expected:', nextDay, 'got:', day);
      return NextResponse.json({ 
        error: `You must claim Day ${nextDay} first`,
        expectedDay: nextDay 
      }, { status: 400 });
    }

    // Calculate reward based on cycle
    const rewardAmount = getRewardForDay(day);
    const newBalance = user.coins + rewardAmount;

    console.log('[Claim Daily] Reward amount:', rewardAmount);
    console.log('[Claim Daily] New balance will be:', newBalance);

    // Create daily streak record and update user
    // Generate UUID compatible with Cloudflare Workers
    let streakId: string;
    try {
      streakId = crypto.randomUUID();
    } catch (e) {
      // Fallback for environments without crypto.randomUUID
      streakId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    console.log('[Claim Daily] Creating streak record:', streakId);
    
    // Use D1 batch for transaction-like behavior
    try {
      await executeRun(
        `INSERT INTO DailyStreak (id, userId, day, weekStart, claimedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [streakId, session.user.id, day, today.toISOString(), today.toISOString()]
      );

      console.log('[Claim Daily] Streak record created');

      await executeRun(
        `UPDATE User 
         SET coins = ?, lastDailyClaimed = ?, updatedAt = datetime('now')
         WHERE id = ?`,
        [newBalance, today.toISOString(), session.user.id]
      );

      console.log('[Claim Daily] User updated successfully');
    } catch (dbError) {
      console.error('[Claim Daily] Database error:', dbError);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      newBalance,
      streak: nextDay,
    });
  } catch (error) {
    console.error('[Claim Daily] Error:', error);
    console.error('[Claim Daily] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Claim Daily] Error message:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function PUT() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

export async function DELETE() { 
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); 
}

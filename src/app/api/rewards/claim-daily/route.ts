import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery, executeOne, executeRun } from '@/lib/d1';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { day } = await req.json() as { day: number };

    if (!day || day < 1) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const user = await executeOne(
      'SELECT id, coins, lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already claimed today
    if (user.lastDailyClaimed) {
      const lastClaimed = new Date(user.lastDailyClaimed);
      lastClaimed.setHours(0, 0, 0, 0);
      
      if (lastClaimed.getTime() === today.getTime()) {
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

    // Validate user is claiming the correct next day
    if (day !== nextDay) {
      return NextResponse.json({ 
        error: `You must claim Day ${nextDay} first`,
        expectedDay: nextDay 
      }, { status: 400 });
    }

    // Calculate reward based on cycle
    const rewardAmount = getRewardForDay(day);
    const newBalance = user.coins + rewardAmount;

    // Create daily streak record and update user
    const streakId = crypto.randomUUID();
    
    // Use D1 batch for transaction-like behavior
    await executeRun(
      `INSERT INTO DailyStreak (id, userId, day, weekStart, claimedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [streakId, session.user.id, day, today.toISOString(), today.toISOString()]
    );

    await executeRun(
      `UPDATE User 
       SET coins = ?, lastDailyClaimed = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [newBalance, today.toISOString(), session.user.id]
    );

    return NextResponse.json({
      success: true,
      newBalance,
      streak: nextDay,
    });
  } catch (error) {
    console.error('[Claim Daily] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

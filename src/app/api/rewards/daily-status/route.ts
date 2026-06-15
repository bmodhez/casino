import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery, executeOne } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total streak count (all claims)
    const streakCount = await executeOne(
      'SELECT COUNT(*) as count FROM DailyStreak WHERE userId = ?',
      [session.user.id]
    );

    const currentStreak = streakCount?.count || 0;

    // Check if user claimed today
    const user = await executeOne(
      'SELECT lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

    let canClaimToday = true;
    if (user?.lastDailyClaimed) {
      const lastClaimed = new Date(user.lastDailyClaimed);
      lastClaimed.setHours(0, 0, 0, 0);
      canClaimToday = lastClaimed.getTime() !== today.getTime();
    }

    return NextResponse.json({
      claimedDays: [], // Not needed for infinite streak
      currentStreak,
      canClaimToday,
    });
  } catch (error) {
    console.error('[Daily Status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

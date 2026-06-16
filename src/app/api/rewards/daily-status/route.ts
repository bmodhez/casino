import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error('[Daily Status] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Daily Status] User ID:', session.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    console.log('[Daily Status] Today date:', todayStr);

    // Get total streak count (all claims)
    const streakCount = await executeOne(
      'SELECT COUNT(*) as count FROM DailyStreak WHERE userId = ?',
      [session.user.id]
    );

    const currentStreak = streakCount?.count || 0;
    console.log('[Daily Status] Current streak count:', currentStreak);

    // Check if user claimed today
    const user = await executeOne(
      'SELECT lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

    console.log('[Daily Status] User last claimed:', user?.lastDailyClaimed);

    let canClaimToday = true;
    if (user?.lastDailyClaimed) {
      const lastClaimed = new Date(user.lastDailyClaimed);
      lastClaimed.setHours(0, 0, 0, 0);
      const lastClaimedStr = lastClaimed.toISOString().split('T')[0];
      canClaimToday = lastClaimedStr !== todayStr;
      console.log('[Daily Status] Can claim today:', canClaimToday);
    }

    const response = {
      claimedDays: [], // Not needed for infinite streak
      currentStreak,
      nextDay: currentStreak + 1, // Next claimable day
      canClaimToday,
    };

    console.log('[Daily Status] Response:', response);

    return NextResponse.json(response);
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

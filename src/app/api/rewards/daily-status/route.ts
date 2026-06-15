import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery } from '@/lib/d1';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = getWeekStart(today);

    // Get all claimed days for current week
    const claimedStreaks = await executeQuery(
      `SELECT day, claimedAt FROM DailyStreak 
       WHERE userId = ? AND weekStart = ?
       ORDER BY day ASC`,
      [session.user.id, weekStart.toISOString()]
    );

    const streaks = claimedStreaks?.results || [];
    const claimedDays = streaks.map((s: any) => s.day);
    const currentStreak = claimedDays.length;

    // Check if user claimed today
    const claimedToday = streaks.some((streak: any) => {
      const claimDate = new Date(streak.claimedAt);
      claimDate.setHours(0, 0, 0, 0);
      return claimDate.getTime() === today.getTime();
    });

    const canClaimToday = !claimedToday;

    return NextResponse.json({
      claimedDays,
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

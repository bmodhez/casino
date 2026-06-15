import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:

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
    const claimedStreaks = await prisma.dailyStreak.findMany({
      where: {
        userId: session.user.id,
        weekStart: weekStart,
      },
      select: { day: true, claimedAt: true },
      orderBy: { day: 'asc' },
    });

    const claimedDays = claimedStreaks.map(s => s.day);
    const currentStreak = claimedDays.length;

    // Check if user claimed today by looking at claimedAt dates
    const claimedToday = claimedStreaks.some(streak => {
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
    console.error('Error in daily-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

*/

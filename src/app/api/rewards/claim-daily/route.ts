import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

const DAILY_REWARDS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 35,
  4: 45,
  5: 55,
  6: 65,
  7: 100,
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { day } = await req.json();

    if (!day || day < 1 || day > 7) {
      return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = getWeekStart(today);

    // Get current claimed days in this week
    const claimedStreaks = await prisma.dailyStreak.findMany({
      where: {
        userId: session.user.id,
        weekStart: weekStart,
      },
      select: { day: true, claimedAt: true },
    });

    // Check if already claimed today by looking at claimedAt dates
    const claimedToday = claimedStreaks.some(streak => {
      const claimDate = new Date(streak.claimedAt);
      claimDate.setHours(0, 0, 0, 0);
      return claimDate.getTime() === today.getTime();
    });

    if (claimedToday) {
      return NextResponse.json({ error: 'Already claimed today' }, { status: 400 });
    }

    const claimedDays = claimedStreaks.map(s => s.day);
    const nextDay = claimedDays.length + 1;

    // Validate user is claiming the correct next day
    if (day !== nextDay) {
      return NextResponse.json({ 
        error: `You must claim Day ${nextDay} first`,
        expectedDay: nextDay 
      }, { status: 400 });
    }

    // Check if this exact day already claimed
    if (claimedDays.includes(day)) {
      return NextResponse.json({ error: 'Day already claimed' }, { status: 400 });
    }

    const rewardAmount = DAILY_REWARDS[day] || 10;
    const newBalance = user.coins + rewardAmount;

    // Create daily streak record and update user
    await prisma.$transaction([
      prisma.dailyStreak.create({
        data: {
          userId: session.user.id,
          day,
          weekStart,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          coins: newBalance,
          lastDailyClaimed: today,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance,
      streak: claimedDays.length + 1,
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

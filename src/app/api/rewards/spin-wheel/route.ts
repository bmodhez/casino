import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const WHEEL_SEGMENTS = [5, 10, 15, 20, 25, 30, 50, 75, 100, 150, 200];

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true, lastDailyClaimed: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already spun in last 24 hours
    if (user.lastDailyClaimed) {
      const lastSpinDate = new Date(user.lastDailyClaimed);
      const now = new Date();
      const hoursPassed = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        return NextResponse.json({ error: 'You can spin once every 24 hours' }, { status: 400 });
      }
    }

    // Generate random segment index (provably fair in production)
    const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const amount = WHEEL_SEGMENTS[segmentIndex];

    // Update user balance and last spin time
    const newBalance = user.coins + amount;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: newBalance,
        lastDailyClaimed: new Date(), // Track last spin time
      },
    });

    return NextResponse.json({
      success: true,
      amount,
      segmentIndex,
      newBalance,
    });
  } catch (error) {
    console.error('[WHEEL] Error spinning wheel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

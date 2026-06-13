import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastDailyClaimed: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let canSpin = true;
    let timeLeft = 0;

    // Temporarily using lastDailyClaimed to track wheel spins
    // In production, add a separate lastWheelSpin field
    if (user.lastDailyClaimed) {
      const lastSpinDate = new Date(user.lastDailyClaimed);
      const now = new Date();
      const hoursPassed = (now.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        canSpin = false;
        timeLeft = Math.ceil((24 - hoursPassed) * 3600); // seconds left
      }
    }

    return NextResponse.json({
      canSpin,
      timeLeft,
    });
  } catch (error) {
    console.error('Error in wheel-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

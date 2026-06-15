import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne, executeRun } from '@/lib/d1';

const WHEEL_SEGMENTS = [5, 10, 15, 20, 25, 30, 50, 75, 100, 150, 200];

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await executeOne(
      'SELECT coins, lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

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

    await executeRun(
      `UPDATE User 
       SET coins = ?, lastDailyClaimed = ?, updatedAt = datetime('now')
       WHERE id = ?`,
      [newBalance, new Date().toISOString(), session.user.id]
    );

    return NextResponse.json({
      success: true,
      amount,
      segmentIndex,
      newBalance,
    });
  } catch (error) {
    console.error('[Wheel] Error:', error);
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

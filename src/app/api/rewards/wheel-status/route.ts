import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await executeOne(
      'SELECT lastDailyClaimed FROM User WHERE id = ?',
      [session.user.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let canSpin = true;
    let timeLeft = 0;

    // Using lastDailyClaimed to track wheel spins
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
    console.error('[Wheel Status] Error:', error);
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

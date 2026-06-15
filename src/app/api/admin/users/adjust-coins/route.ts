import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeRun } from '@/lib/d1';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount } = await req.json() as { userId: string; amount: number };

    if (!userId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Update user coins
    await executeRun(
      'UPDATE User SET coins = coins + ?, updatedAt = ? WHERE id = ?',
      [amount, new Date().toISOString(), userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Adjust Coins] Error:', error);
    return NextResponse.json({ error: 'Failed to adjust coins' }, { status: 500 });
  }
}

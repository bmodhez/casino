import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeRun } from '@/lib/d1';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeRun } from '@/lib/d1';

export async function POST(req: NextRequest) {
  try {
    console.log('[Admin Adjust Coins] Request received');
    
    const session = await auth();
    console.log('[Admin Adjust Coins] Session:', session?.user?.id, 'Role:', (session?.user as any)?.role);
    
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[Admin Adjust Coins] Body:', body);
    
    const { userId, amount } = body as { userId: string; amount: number };

    if (!userId || typeof amount !== 'number') {
      console.error('[Admin Adjust Coins] Invalid parameters:', { userId, amount });
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    console.log('[Admin Adjust Coins] Updating coins for user:', userId, 'Amount:', amount);

    // Update user coins
    const result = await executeRun(
      'UPDATE User SET coins = coins + ?, updatedAt = ? WHERE id = ?',
      [amount, new Date().toISOString(), userId]
    );

    console.log('[Admin Adjust Coins] Update result:', result);

    return NextResponse.json({ success: true, message: `Coins adjusted by ${amount}` });
  } catch (error) {
    console.error('[Admin Adjust Coins] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to adjust coins', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Add other HTTP methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

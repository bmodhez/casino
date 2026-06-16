import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeRun } from '@/lib/d1';

export async function POST(req: NextRequest) {
  try {
    console.log('[Admin Ban] Request received');
    
    const session = await auth();
    console.log('[Admin Ban] Session user:', session?.user?.id, 'Role:', (session?.user as any)?.role);
    
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      console.error('[Admin Ban] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[Admin Ban] Request body:', body);
    
    const { userId, banned } = body as { userId: string; banned: boolean };

    if (!userId) {
      console.error('[Admin Ban] Missing userId');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    console.log('[Admin Ban] Updating user:', userId, 'Banned:', banned);

    // Update user banned status
    const result = await executeRun(
      'UPDATE User SET banned = ?, updatedAt = ? WHERE id = ?',
      [banned ? 1 : 0, new Date().toISOString(), userId]
    );

    console.log('[Admin Ban] Update result:', result);

    return NextResponse.json({ success: true, message: `User ${banned ? 'banned' : 'unbanned'} successfully` });
  } catch (error) {
    console.error('[Admin Ban] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update user',
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

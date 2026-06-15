import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeRun } from '@/lib/d1';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, banned } = await req.json() as { userId: string; banned: boolean };

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Update user banned status
    await executeRun(
      'UPDATE User SET banned = ?, updatedAt = ? WHERE id = ?',
      [banned ? 1 : 0, new Date().toISOString(), userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Ban] Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

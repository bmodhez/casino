import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeQuery } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (lightweight query)
    const adminCheck = await executeQuery(
      'SELECT role FROM User WHERE id = ? LIMIT 1',
      [session.user.id]
    );

    if (!adminCheck.results?.[0] || (adminCheck.results[0] as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch users only - NO JOINS to prevent timeout
    const usersResult = await executeQuery(`
      SELECT 
        id,
        username,
        email,
        role,
        coins,
        level,
        banned,
        createdAt
      FROM User
      ORDER BY createdAt DESC
      LIMIT 100
    `, []);

    // Add placeholder stats (0) to match expected structure
    const users = (usersResult.results || []).map((user: any) => ({
      ...user,
      totalGamesPlayed: 0,
      totalWagered: 0,
      totalPayout: 0
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
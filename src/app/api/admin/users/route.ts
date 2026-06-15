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

    // Fetch users with aggregated game stats (single optimized query with LEFT JOIN)
    const usersResult = await executeQuery(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.coins,
        u.level,
        u.banned,
        u.createdAt,
        COALESCE(COUNT(gh.id), 0) as totalGamesPlayed,
        COALESCE(SUM(gh.betAmount), 0) as totalWagered,
        COALESCE(SUM(gh.payout), 0) as totalPayout
      FROM User u
      LEFT JOIN GameHistory gh ON u.id = gh.userId
      GROUP BY u.id
      ORDER BY u.createdAt DESC
      LIMIT 100
    `, []);

    return NextResponse.json({ 
      users: usersResult.results || []
    });
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
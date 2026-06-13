import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all users with game count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        coins: true,
        level: true,
        role: true,
        createdAt: true,
        _count: {
          select: { gameHistory: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithGameCount = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      coins: user.coins,
      level: user.level,
      role: user.role,
      createdAt: user.createdAt,
      totalGames: user._count.gameHistory,
    }));

    return NextResponse.json(usersWithGameCount);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

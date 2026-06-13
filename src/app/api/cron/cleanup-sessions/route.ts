import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();

  const result = await prisma.gameSession.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: now },
    },
    data: { status: 'EXPIRED' },
  });

  return NextResponse.json({ expired: result.count });
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeSeed = await prisma.provablyFairSeed.findFirst({
    where: { userId: session.user.id, active: true },
    select: {
      id: true,
      serverSeedHash: true,
      clientSeed: true,
      nonce: true,
      createdAt: true,
    },
  });

  if (!activeSeed) {
    return NextResponse.json({ error: 'No active seed found' }, { status: 404 });
  }

  return NextResponse.json({ activeSeed });
}

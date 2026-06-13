import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateServerSeed, hashServerSeed, generateClientSeed } from '@/lib/fairness';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Deactivate old seed
  await prisma.provablyFairSeed.updateMany({
    where: { userId: session.user.id, active: true },
    data: { active: false },
  });

  // Create new seed
  const newServerSeed = generateServerSeed();
  const newServerSeedHash = hashServerSeed(newServerSeed);
  const newClientSeed = generateClientSeed();

  const newSeed = await prisma.provablyFairSeed.create({
    data: {
      userId: session.user.id,
      serverSeed: newServerSeed,
      serverSeedHash: newServerSeedHash,
      clientSeed: newClientSeed,
      nonce: 0,
      active: true,
    },
    select: {
      id: true,
      serverSeedHash: true,
      clientSeed: true,
      nonce: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ newSeed });
}

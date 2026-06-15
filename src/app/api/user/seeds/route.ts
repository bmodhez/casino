import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:

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

*/

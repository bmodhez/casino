import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = await req.json();

  if (!username || username.length < 3) {
    return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  // Check if username already exists
  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
  });

  return NextResponse.json({ success: true });
}

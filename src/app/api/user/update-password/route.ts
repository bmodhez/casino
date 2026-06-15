import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { notImplementedYet } from '@/lib/stub-api';

export async function GET() { return notImplementedYet(); }
export async function POST() { return notImplementedYet(); }
export async function PUT() { return notImplementedYet(); }
export async function DELETE() { return notImplementedYet(); }

/* Original code commented out:
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'User not found or OAuth account' }, { status: 404 });
  }

  // Verify current password
  const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashedPassword },
  });

  return NextResponse.json({ success: true });
}

*/

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeOne } from '@/lib/d1';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await executeOne(
      'SELECT coins, xp, level FROM User WHERE id = ?',
      [session.user.id]
    );

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

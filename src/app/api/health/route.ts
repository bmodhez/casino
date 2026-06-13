import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const envCheck = {
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasCronSecret: !!process.env.CRON_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'ok',
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}

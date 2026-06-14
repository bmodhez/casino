import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const envCheck = {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasCronSecret: !!process.env.CRON_SECRET,
      nodeEnv: process.env.NODE_ENV || 'unknown',
    };

    return NextResponse.json({
      status: 'ok',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

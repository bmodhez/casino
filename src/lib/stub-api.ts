// Temporary stub for API routes that haven't been migrated to D1 yet
import { NextResponse } from 'next/server';

export function notImplementedYet() {
  return NextResponse.json(
    { error: 'This endpoint is being migrated to D1 database. Please try again later.' },
    { status: 503 }
  );
}

// Prisma is NOT used in production - we use D1 raw SQL instead
// This file is kept for backward compatibility only

// DO NOT import PrismaClient in production code
// Use executeQuery, executeOne, executeRun from @/lib/d1 instead

export const prisma = new Proxy({} as any, {
  get() {
    throw new Error(
      'Prisma Client is not available in Cloudflare Workers. ' +
      'Use D1 raw SQL queries via executeQuery, executeOne, or executeRun from @/lib/d1'
    );
  },
});

export function getDB(): any {
  throw new Error(
    'getDB() is not available in Cloudflare Workers. ' +
    'Use D1 raw SQL queries via executeQuery, executeOne, or executeRun from @/lib/d1'
  );
}

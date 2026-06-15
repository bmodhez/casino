import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Get Cloudflare env from AsyncLocalStorage context
function getCloudflareContext() {
  try {
    // @ts-ignore - Cloudflare Workers context
    return globalThis[Symbol.for('__cloudflare-request-context__')];
  } catch {
    return null;
  }
}

let cachedPrisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (cachedPrisma) {
    return cachedPrisma;
  }

  // Try to get D1 binding from Cloudflare context
  const ctx = getCloudflareContext();
  const db = ctx?.env?.DB;

  if (db) {
    // Use D1 adapter in production
    const adapter = new PrismaD1(db);
    cachedPrisma = new PrismaClient({ 
      adapter,
      log: ['error'],
    });
  } else {
    // Fallback for build time
    cachedPrisma = new PrismaClient({
      log: ['error'],
    });
  }

  return cachedPrisma;
}

// Export prisma instance - will work at build time and runtime
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient();
    return (client as any)[prop];
  },
});

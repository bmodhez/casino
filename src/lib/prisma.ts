import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Cloudflare D1 type - will be available in Workers runtime
type D1Database = any;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaClientSingleton: PrismaClient | undefined;

function createPrismaClient(db?: D1Database): PrismaClient {
  // If D1 binding is available (Cloudflare Workers runtime)
  if (db) {
    const adapter = new PrismaD1(db);
    return new PrismaClient({ 
      adapter,
      log: ['error'],
    });
  }
  
  // Build-time or local dev fallback
  return new PrismaClient({
    log: ['error'],
  });
}

// Export getter function that accepts D1 binding
export function getPrismaClient(db?: D1Database): PrismaClient {
  if (prismaClientSingleton) {
    return prismaClientSingleton;
  }
  
  if (global.__prisma) {
    prismaClientSingleton = global.__prisma;
    return prismaClientSingleton;
  }
  
  prismaClientSingleton = createPrismaClient(db);
  
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prismaClientSingleton;
  }
  
  return prismaClientSingleton;
}

// Default export for build-time compatibility
export const prisma = getPrismaClient();

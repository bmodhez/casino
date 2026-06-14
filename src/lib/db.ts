import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

// Cache for Prisma client
let cachedPrisma: PrismaClient | null = null;

export function getDB(d1?: any): PrismaClient {
  // Return cached client if available
  if (cachedPrisma) {
    return cachedPrisma;
  }

  // If D1 binding is provided, use it
  if (d1) {
    const adapter = new PrismaD1(d1);
    cachedPrisma = new PrismaClient({ 
      adapter,
      log: ['error'],
    });
    return cachedPrisma;
  }

  // Fallback: create client without adapter (for build time)
  cachedPrisma = new PrismaClient({
    log: ['error'],
  });
  
  return cachedPrisma;
}

// For Next.js API routes that need access to DB
// They should use getDB() instead of importing prisma directly
export const prisma = getDB();

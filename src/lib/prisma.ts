import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

let cachedPrisma: PrismaClient | null = null;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  // During build time, return a dummy client that won't actually connect
  if (!connectionString || typeof window === 'undefined' && !process.env.CLOUDFLARE_ACCOUNT_ID) {
    // Build-time placeholder - won't actually connect to DB
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
        },
      },
    });
  }
  
  // Runtime client with Neon adapter for Cloudflare Workers
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Use a getter to ensure lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!cachedPrisma) {
      if (global.prismaInstance) {
        cachedPrisma = global.prismaInstance;
      } else {
        cachedPrisma = createPrismaClient();
        if (process.env.NODE_ENV !== 'production') {
          global.prismaInstance = cachedPrisma;
        }
      }
    }
    return (cachedPrisma as any)[prop];
  },
});

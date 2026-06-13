import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  // Return a dummy client during build time
  if (!connectionString) {
    console.warn('DATABASE_URL not set - using build-time placeholder');
    return new PrismaClient();
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = global.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

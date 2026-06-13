import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

declare global {
  // eslint-disable-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaClientSingleton: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    // Build-time placeholder - won't connect
    return new PrismaClient({
      datasources: { db: { url: 'postgresql://placeholder@localhost/placeholder' } },
    });
  }
  
  // Create Neon pool connection
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ 
    adapter,
    log: ['error'],
  });
}

// Export getter function instead of direct client to delay initialization
function getPrisma(): PrismaClient {
  if (prismaClientSingleton) {
    return prismaClientSingleton;
  }
  
  if (global.__prisma) {
    prismaClientSingleton = global.__prisma;
    return prismaClientSingleton;
  }
  
  prismaClientSingleton = createPrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prismaClientSingleton;
  }
  
  return prismaClientSingleton;
}

// Export as proxy to truly lazy-load
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});

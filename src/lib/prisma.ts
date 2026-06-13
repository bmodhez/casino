import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  // Check global cache first
  if (global.prismaGlobal) {
    prismaInstance = global.prismaGlobal;
    return prismaInstance;
  }

  const connectionString = process.env.DATABASE_URL;
  
  // During build time or if no DATABASE_URL, create a dummy client
  if (!connectionString) {
    console.warn('DATABASE_URL not set - creating placeholder client');
    const client = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
        },
      },
    });
    prismaInstance = client;
    return client;
  }
  
  // Runtime client with Neon adapter for Cloudflare Workers
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    
    const client = new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    prismaInstance = client;
    
    // Cache in global for dev
    if (process.env.NODE_ENV !== 'production') {
      global.prismaGlobal = client;
    }
    
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

export const prisma = getPrismaClient();

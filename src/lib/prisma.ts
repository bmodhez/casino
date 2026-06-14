import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prismaClientSingleton: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: ['error'],
  });
}

export function getPrismaClient(): PrismaClient {
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

// Default export
export const prisma = getPrismaClient();

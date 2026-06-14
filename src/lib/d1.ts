// Direct D1 database access without Prisma
// This avoids the fs.readdir issue in Cloudflare Workers

type D1Database = any;

// Get D1 binding from Cloudflare context
export function getD1(): D1Database | null {
  try {
    // @ts-ignore - Cloudflare Workers context
    const ctx = globalThis[Symbol.for('__cloudflare-request-context__')];
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

// Helper to execute queries
export async function executeQuery(sql: string, params: any[] = []) {
  const db = getD1();
  if (!db) {
    throw new Error('D1 database not available');
  }
  
  return await db.prepare(sql).bind(...params).all();
}

export async function executeOne(sql: string, params: any[] = []) {
  const db = getD1();
  if (!db) {
    throw new Error('D1 database not available');
  }
  
  return await db.prepare(sql).bind(...params).first();
}

export async function executeRun(sql: string, params: any[] = []) {
  const db = getD1();
  if (!db) {
    throw new Error('D1 database not available');
  }
  
  return await db.prepare(sql).bind(...params).run();
}

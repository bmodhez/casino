// Direct D1 database access using OpenNext Cloudflare context
import { getCloudflareContext } from '@opennextjs/cloudflare';

type D1Database = any;

// Get D1 binding using proper OpenNext method
export function getD1(): D1Database {
  try {
    const context = getCloudflareContext();
    console.log('[D1] Context keys:', Object.keys(context || {}));
    console.log('[D1] Env available:', !!context?.env);
    console.log('[D1] DB binding available:', !!context?.env?.DB);
    
    if (!context) {
      throw new Error('Cloudflare context not available');
    }
    
    if (!context.env) {
      throw new Error('Cloudflare env not available in context');
    }
    
    if (!context.env.DB) {
      console.error('[D1] Available env keys:', Object.keys(context.env));
      throw new Error('D1 binding (DB) not found in env');
    }
    
    return context.env.DB;
  } catch (error) {
    console.error('[D1] Error getting D1 binding:', error);
    throw error;
  }
}

// Helper to execute queries
export async function executeQuery(sql: string, params: any[] = []) {
  const db = getD1();
  return await db.prepare(sql).bind(...params).all();
}

export async function executeOne(sql: string, params: any[] = []) {
  const db = getD1();
  return await db.prepare(sql).bind(...params).first();
}

export async function executeRun(sql: string, params: any[] = []) {
  const db = getD1();
  return await db.prepare(sql).bind(...params).run();
}

// Execute multiple queries in batch
export async function executeAll(queries: { sql: string; params: any[] }[]) {
  const db = getD1();
  const results = await db.batch(
    queries.map(q => db.prepare(q.sql).bind(...q.params))
  );
  return results.map((r: any) => r.results);
}

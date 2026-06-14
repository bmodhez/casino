// Direct D1 database access using OpenNext Cloudflare context
import { getCloudflareContext } from '@opennextjs/cloudflare';

type D1Database = any;

// Get D1 binding using proper OpenNext method
export function getD1(): D1Database {
  try {
    const { env } = getCloudflareContext();
    if (!env?.DB) {
      throw new Error('D1 binding (DB) not found in Cloudflare context');
    }
    return env.DB;
  } catch (error) {
    console.error('Error getting D1 binding:', error);
    throw new Error('D1 database not available - make sure DB binding is configured in wrangler.jsonc');
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

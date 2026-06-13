import crypto from 'crypto';

/**
 * Generate a cryptographically secure random server seed
 */
export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random client seed
 */
export function generateClientSeed(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a server seed using SHA-256
 */
export function hashServerSeed(serverSeed: string): string {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Generate a provably fair HMAC-SHA512 hash
 */
export function generateHash(serverSeed: string, clientSeed: string, nonce: number): string {
  const message = `${clientSeed}:${nonce}`;
  return crypto.createHmac('sha512', serverSeed).update(message).digest('hex');
}

/**
 * Extract a float between 0 and 1 from the hash at a given index
 */
export function getFloat(hash: string, index: number = 0): number {
  const offset = index * 8;
  const hexSubstring = hash.substring(offset, offset + 8);
  const intValue = parseInt(hexSubstring, 16);
  return intValue / 0xffffffff;
}

/**
 * MINES: Generate mine positions for a 5x5 grid
 */
export function getMinePositions(serverSeed: string, clientSeed: string, nonce: number, mineCount: number): number[] {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  const positions = Array.from({ length: 25 }, (_, i) => i);
  
  // Fisher-Yates shuffle using the hash
  for (let i = positions.length - 1; i > 0; i--) {
    const offset = (positions.length - 1 - i) * 8;
    const hexSub = hash.substring(offset % (hash.length - 8), (offset % (hash.length - 8)) + 8);
    const rand = parseInt(hexSub, 16) / 0xffffffff;
    const j = Math.floor(rand * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  return positions.slice(0, mineCount);
}

/**
 * CRASH: Calculate crash point from hash
 */
export function getCrashPoint(serverSeed: string, clientSeed: string, nonce: number): number {
  const hash = generateHash(serverSeed, clientSeed, nonce);

  // Use first 13 hex chars (52 bits) so h is comparable to e = 2^52
  const h = parseInt(hash.substring(0, 13), 16);

  // 3% house edge — instant crash at 1.00x
  if (h % 33 === 0) return 1.0;

  const e = Math.pow(2, 52);
  const crashPoint = Math.floor((100 * e - h) / (e - h)) / 100;

  return Math.max(1.01, crashPoint);
}

/**
 * CRASH: Calculate current multiplier from elapsed time (shared by SSE + cashout)
 * Uses slower growth (0.003/frame) so early sub-2x rounds last a few ticks
 */
const CRASH_RATE = 0.03;

export function getCrashMultiplier(elapsedMs: number): number {
  const frames = elapsedMs / 100;
  return parseFloat(Math.exp(CRASH_RATE * frames).toFixed(4));
}

/**
 * DICE: Generate a dice roll between 0.00 and 99.99
 */
export function getDiceRoll(serverSeed: string, clientSeed: string, nonce: number): number {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  const intVal = parseInt(hash.substring(0, 8), 16);
  return (intVal % 10000) / 100;
}

/**
 * COINFLIP: Get heads (true) or tails (false)
 */
export function getCoinResult(serverSeed: string, clientSeed: string, nonce: number): boolean {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  return parseInt(hash.substring(0, 2), 16) < 128;
}

/**
 * PLINKO: Get ball path (array of L/R decisions)
 */
export function getPlinkoPaths(serverSeed: string, clientSeed: string, nonce: number, rows: number): boolean[] {
  const hash = generateHash(serverSeed, clientSeed, nonce);
  const paths: boolean[] = [];
  
  for (let i = 0; i < rows; i++) {
    const byteIndex = Math.floor(i / 4) * 8;
    const bitOffset = (i % 4) * 2;
    const hexSub = hash.substring(byteIndex % (hash.length - 8), (byteIndex % (hash.length - 8)) + 8);
    const val = parseInt(hexSub, 16);
    paths.push(((val >> bitOffset) & 1) === 1);
  }
  
  return paths;
}

/**
 * MINES: Calculate multiplier based on mines count and gems revealed
 * More mines = higher risk = higher multiplier
 * Formula: For each gem revealed, multiply by (remaining_cells / remaining_safe_cells)
 */
export function calculateMinesMultiplier(totalMines: number, gemsRevealed: number): number {
  const totalCells = 25;
  const safeCells = totalCells - totalMines;
  
  if (gemsRevealed === 0) return 1;
  if (gemsRevealed > safeCells) return 0;
  
  let multiplier = 1;
  
  // Each revealed gem increases multiplier based on remaining cells vs remaining safe cells
  for (let k = 0; k < gemsRevealed; k++) {
    const remainingCells = totalCells - k;
    const remainingSafeCells = safeCells - k;
    multiplier *= remainingCells / remainingSafeCells;
  }
  
  // Apply house edge (2%)
  multiplier *= 0.98;
  
  return Math.max(1.0, multiplier);
}

/**
 * PLINKO: Get multiplier tables for different risk levels
 */
export function getPlinkoMultiplier(slot: number, rows: number, risk: 'LOW' | 'MEDIUM' | 'HIGH'): number {
  const tables: Record<'LOW' | 'MEDIUM' | 'HIGH', Record<number, number[]>> = {
    LOW: {
      8:  [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
      12: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
      16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    },
    MEDIUM: {
      8:  [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      12: [33, 11, 4, 2, 0.8, 0.7, 0.8, 2, 4, 11, 33],
      16: [110, 41, 10, 5, 3, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3, 5, 10, 41, 110],
    },
    HIGH: {
      8:  [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
      12: [141, 26, 5.5, 1.4, 0.4, 0.2, 0.4, 1.4, 5.5, 26, 141],
      16: [999, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 999],
    },
  };
  
  const table = tables[risk][rows];
  if (!table) return 1;
  return table[Math.min(slot, table.length - 1)];
}

import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.leaderboard-cache.json');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface LeaderboardEntry {
  id: string;
  username: string;
  image: string | null;
  coins: number;
  level: number;
  xp: number;
  totalGames: number;
  totalWins: number;
  winRate: number;
}

interface CacheData {
  timestamp: number;
  data: LeaderboardEntry[];
}

export function getCachedLeaderboard(): LeaderboardEntry[] | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache: CacheData = JSON.parse(raw);
    if (Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCachedLeaderboard(data: LeaderboardEntry[]): void {
  try {
    const cache: CacheData = { timestamp: Date.now(), data };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
  } catch {
    // Silently fail - cache is non-critical
  }
}

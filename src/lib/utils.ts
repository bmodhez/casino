export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatCoins(amount: number): string {
  // Always show exact number with comma separators
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

export function getRankFromLevel(level: number): { name: string; color: string; gradient: string } {
  if (level >= 200) return { name: 'Master', color: '#FF6B6B', gradient: 'from-red-500 to-orange-500' };
  if (level >= 100) return { name: 'Diamond', color: '#67E8F9', gradient: 'from-cyan-400 to-blue-500' };
  if (level >= 50) return { name: 'Platinum', color: '#E2E8F0', gradient: 'from-slate-300 to-slate-500' };
  if (level >= 25) return { name: 'Gold', color: '#FBBF24', gradient: 'from-yellow-400 to-amber-500' };
  if (level >= 10) return { name: 'Silver', color: '#94A3B8', gradient: 'from-slate-400 to-slate-600' };
  return { name: 'Bronze', color: '#CD7F32', gradient: 'from-amber-700 to-amber-900' };
}

export function getXPForNextLevel(level: number): number {
  return level * 1000;
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let xpRequired = 1000;
  let totalXP = 0;
  
  while (totalXP + xpRequired <= xp) {
    totalXP += xpRequired;
    level++;
    xpRequired = level * 1000;
  }
  
  return level;
}

export function getXPProgressInLevel(xp: number): { current: number; required: number; percentage: number } {
  let level = 1;
  let xpRequired = 1000;
  let totalXP = 0;
  
  while (totalXP + xpRequired <= xp) {
    totalXP += xpRequired;
    level++;
    xpRequired = level * 1000;
  }
  
  const currentInLevel = xp - totalXP;
  return {
    current: currentInLevel,
    required: xpRequired,
    percentage: Math.min(100, (currentInLevel / xpRequired) * 100),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

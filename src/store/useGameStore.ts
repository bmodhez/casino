import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameStore {
  coins: number;
  xp: number;
  level: number;
  username: string;
  userId: string;
  setUser: (user: { coins: number; xp: number; level: number; username: string; userId: string }) => void;
  updateCoins: (coins: number) => void;
  addXP: (xp: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      coins: 0,
      xp: 0,
      level: 1,
      username: '',
      userId: '',
      setUser: (user) => set(user),
      updateCoins: (coins) => set({ coins }),
      addXP: (xp) =>
        set((state) => {
          const newXP = state.xp + xp;
          let newLevel = 1;
          let totalXP = 0;
          let xpRequired = 1000;
          while (totalXP + xpRequired <= newXP) {
            totalXP += xpRequired;
            newLevel++;
            xpRequired = newLevel * 1000;
          }
          return { xp: newXP, level: newLevel };
        }),
      reset: () => set({ coins: 0, xp: 0, level: 1, username: '', userId: '' }),
    }),
    { name: 'game-store' }
  )
);

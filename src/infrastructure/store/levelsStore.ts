import { create } from 'zustand';
import type { Level } from '../../domain/entities/Level';

interface LevelsState {
  levels: Level[];
  currentLevel: Level | null;
  isLoading: boolean;
  error: string | null;
  setLevels: (levels: Level[]) => void;
  setCurrentLevel: (level: Level | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLevelsStore = create<LevelsState>((set) => ({
  levels: [],
  currentLevel: null,
  isLoading: false,
  error: null,
  setLevels: (levels) => set({ levels }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));
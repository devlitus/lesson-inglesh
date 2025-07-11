import { create } from 'zustand';
import type { Level } from '../../domain/entities/Level';

interface LevelState {
  levels: Level[];
  selectedLevel: Level | null;
  isLoading: boolean;
  error: string | null;
  setLevels: (levels: Level[]) => void;
  setSelectedLevel: (level: Level | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLevelStore = create<LevelState>()((set) => ({
  levels: [],
  selectedLevel: null,
  isLoading: false,
  error: null,
  setLevels: (levels) => set({ levels }),
  setSelectedLevel: (level) => set({ selectedLevel: level }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
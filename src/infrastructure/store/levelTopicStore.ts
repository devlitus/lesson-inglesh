import { create } from 'zustand';
import type { LevelSelection } from '../../domain/entities/Level';

interface LevelTopicState {
  selections: LevelSelection[];
  currentSelection: LevelSelection | null;
  isLoading: boolean;
  error: string | null;
  setSelections: (selections: LevelSelection[]) => void;
  setCurrentSelection: (selection: LevelSelection | null) => void;
  addSelection: (selection: LevelSelection) => void;
  removeSelection: (selectionId: string) => void;
  updateSelection: (selectionId: string, updatedSelection: Partial<LevelSelection>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLevelTopicStore = create<LevelTopicState>((set) => ({
  selections: [],
  currentSelection: null,
  isLoading: false,
  error: null,
  setSelections: (selections) => set({ selections }),
  setCurrentSelection: (selection) => set({ currentSelection: selection }),
  addSelection: (selection) => set((state) => ({ 
    selections: [...state.selections, selection] 
  })),
  removeSelection: (selectionId) => set((state) => ({
    selections: state.selections.filter(s => s.id !== selectionId)
  })),
  updateSelection: (selectionId, updatedSelection) => set((state) => ({
    selections: state.selections.map(s => 
      s.id === selectionId ? { ...s, ...updatedSelection } : s
    )
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));
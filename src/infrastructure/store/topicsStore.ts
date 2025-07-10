import { create } from 'zustand';
import type { Topic } from '../../domain/entities/Topic';

interface TopicsState {
  topics: Topic[];
  currentTopic: Topic | null;
  isLoading: boolean;
  error: string | null;
  setTopics: (topics: Topic[]) => void;
  setCurrentTopic: (topic: Topic | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTopicsStore = create<TopicsState>((set) => ({
  topics: [],
  currentTopic: null,
  isLoading: false,
  error: null,
  setTopics: (topics) => set({ topics }),
  setCurrentTopic: (topic) => set({ currentTopic: topic }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Interface para la selección de level y topic
 * NOTA: No persistir user ID por seguridad - obtener del contexto de autenticación
 */
interface Selection {
  level: string | null; // id_level
  topic: string | null; // id_topic
  // user: string | null; // ELIMINADO: No persistir ID de usuario por seguridad
}

/**
 * Interface para el estado del store de selección
 */
interface SelectionState {
  // Estado
  selection: Selection;
  
  // Acciones
  setSelected: (params: { level: string; topic: string }) => void;
  updateLevel: (level: string) => void;
  updateTopic: (topic: string) => void;
  clearSelection: () => void;
  
  // Getters
  hasCompleteSelection: () => boolean;
  getSelection: () => Selection;
}

/**
 * Store para manejar la selección de level y topic
 * Utiliza Zustand con persistencia en localStorage
 */
export const useSelectionStore = create<SelectionState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      selection: {
        level: null,
        topic: null,
      },

      // Establecer selección completa
      setSelected: ({ level, topic }) => {
        set({
          selection: {
            level,
            topic,
          },
        });
      },

      // Actualizar solo el level
      updateLevel: (level) => {
        set((state) => ({
          selection: {
            ...state.selection,
            level,
          },
        }));
      },

      // Actualizar solo el topic
      updateTopic: (topic) => {
        set((state) => ({
          selection: {
            ...state.selection,
            topic,
          },
        }));
      },

      // Limpiar toda la selección
      clearSelection: () => {
        set({
          selection: {
            level: null,
            topic: null,
          },
        });
      },

      // Verificar si hay una selección completa
      hasCompleteSelection: () => {
        const { selection } = get();
        return !!(selection.level && selection.topic);
      },

      // Obtener la selección actual
      getSelection: () => {
        return get().selection;
      },
    }),
    {
      name: 'selection-storage', // nombre para localStorage
      partialize: (state) => ({ selection: state.selection }), // solo persistir la selección
    }
  )
);

/**
 * Hook personalizado para acceder fácilmente a la selección
 * NOTA: Para obtener el user ID, usar el contexto de autenticación
 */
export const useSelection = () => {
  const store = useSelectionStore();
  
  return {
    // Estado
    selection: store.selection,
    level: store.selection.level,
    topic: store.selection.topic,
    
    // Acciones
    setSelected: store.setSelected,
    updateLevel: store.updateLevel,
    updateTopic: store.updateTopic,
    clearSelection: store.clearSelection,
    
    // Getters
    hasCompleteSelection: store.hasCompleteSelection(),
    getSelection: store.getSelection,
  };
};
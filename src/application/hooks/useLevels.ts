import { useEffect } from 'react';
import { useLevelsStore } from '../../infrastructure/store/levelsStore';
import { getLevelsUseCase, getLevelByIdUseCase } from '../use-cases/getLevels';
import type { Level } from '../../domain/entities/Level';

/**
 * Hook personalizado para manejar los levels
 * Proporciona acceso al estado de levels y funciones para cargarlos
 */
export function useLevels() {
  const {
    levels,
    currentLevel,
    isLoading,
    error,
    setCurrentLevel,
    clearError
  } = useLevelsStore();

  /**
   * Carga todos los levels activos
   */
  const loadLevels = async (): Promise<Level[]> => {
    try {
      return await getLevelsUseCase();
    } catch (error) {
      console.error('Error al cargar levels:', error);
      throw error;
    }
  };

  /**
   * Carga un level específico por ID
   */
  const loadLevelById = async (id: string): Promise<Level | null> => {
    try {
      return await getLevelByIdUseCase(id);
    } catch (error) {
      console.error('Error al cargar level por ID:', error);
      throw error;
    }
  };

  /**
   * Selecciona un level como actual
   */
  const selectLevel = (level: Level | null) => {
    setCurrentLevel(level);
  };

  /**
   * Limpia el error actual
   */
  const clearLevelsError = () => {
    clearError();
  };

  /**
   * Obtiene un level por ID desde el estado actual (sin hacer petición)
   */
  const getLevelFromState = (id: string): Level | undefined => {
    return levels.find(level => level.id === id);
  };

  return {
    // Estado
    levels,
    currentLevel,
    isLoading,
    error,
    
    // Acciones
    loadLevels,
    loadLevelById,
    selectLevel,
    clearLevelsError,
    getLevelFromState,
    
    // Computed
    hasLevels: levels.length > 0,
    levelsCount: levels.length
  };
}

/**
 * Hook que carga automáticamente los levels al montar el componente
 */
export function useLevelsAutoLoad() {
  const levelsHook = useLevels();
  const { loadLevels, levels, isLoading } = levelsHook;

  useEffect(() => {
    // Solo cargar si no hay levels y no está cargando
    if (levels.length === 0 && !isLoading) {
      loadLevels().catch(error => {
        console.error('Error en carga automática de levels:', error);
      });
    }
  }, [levels.length, isLoading, loadLevels]);

  return levelsHook;
}
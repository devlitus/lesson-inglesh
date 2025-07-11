import { useEffect } from 'react';
import { useLevelStore } from '../../infrastructure/store/levelStore';
import { getLevelsUseCase, getLevelByIdUseCase } from '../use-cases/getLevels';
import type { Level } from '../../domain/entities/Level';

/**
 * Hook personalizado para manejar los levels
 * Proporciona funciones para cargar y gestionar el estado de los levels
 */
export function useLevels() {
  const {
    levels,
    selectedLevel,
    isLoading,
    error,
    setLevels,
    setSelectedLevel,
    setLoading,
    setError,
    clearError
  } = useLevelStore();

  /**
   * Carga todos los levels desde Supabase
   */
  const loadLevels = async () => {
    try {
      setLoading(true);
      clearError();
      const levelsData = await getLevelsUseCase();
      setLevels(levelsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los niveles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga un level específico por ID
   * @param id - ID del level a cargar
   */
  const loadLevelById = async (id: string) => {
    try {
      setLoading(true);
      clearError();
      const level = await getLevelByIdUseCase(id);
      setSelectedLevel(level);
      return level;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el nivel';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona un level del estado actual
   * @param level - Level a seleccionar
   */
  const selectLevel = (level: Level | null) => {
    setSelectedLevel(level);
  };

  /**
   * Limpia el error actual
   */
  const clearLevelError = () => {
    clearError();
  };

  return {
    // Estado
    levels,
    selectedLevel,
    isLoading,
    error,
    
    // Acciones
    loadLevels,
    loadLevelById,
    selectLevel,
    clearError: clearLevelError
  };
}

/**
 * Hook que carga automáticamente los levels al montar el componente
 * Útil para componentes que necesitan los levels inmediatamente
 */
export function useLevelsAutoLoad() {
  const levelsHook = useLevels();
  
  useEffect(() => {
    if (levelsHook.levels.length === 0 && !levelsHook.isLoading) {
      levelsHook.loadLevels();
    }
  }, []);
  
  return levelsHook;
}
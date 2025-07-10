import { SupabaseLevelsAdapter } from '../../infrastructure/adapters/SupabaseLevelsAdapter';
import { useLevelsStore } from '../../infrastructure/store/levelsStore';
import type { Level } from '../../domain/entities/Level';

/**
 * Caso de uso para obtener todos los levels activos de la base de datos
 * Actualiza el store global con los levels obtenidos
 */
export async function getLevelsUseCase(): Promise<Level[]> {
  try {
    // Establecer estado de carga
    useLevelsStore.getState().setLoading(true);
    useLevelsStore.getState().clearError();
    
    // Obtener levels desde Supabase
    const levels = await SupabaseLevelsAdapter.getLevels();
    
    // Actualizar el store global
    useLevelsStore.getState().setLevels(levels);
    
    return levels;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener los levels';
    
    // Actualizar el store con el error
    useLevelsStore.getState().setError(errorMessage);
    
    console.error('Error en getLevelsUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelsStore.getState().setLoading(false);
  }
}

/**
 * Caso de uso para obtener un level específico por ID
 * Actualiza el currentLevel en el store si se encuentra
 */
export async function getLevelByIdUseCase(id: string): Promise<Level | null> {
  try {
    // Establecer estado de carga
    useLevelsStore.getState().setLoading(true);
    useLevelsStore.getState().clearError();
    
    // Obtener level desde Supabase
    const level = await SupabaseLevelsAdapter.getLevelById(id);
    
    // Actualizar el store global si se encuentra el level
    if (level) {
      useLevelsStore.getState().setCurrentLevel(level);
    }
    
    return level;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener el level';
    
    // Actualizar el store con el error
    useLevelsStore.getState().setError(errorMessage);
    
    console.error('Error en getLevelByIdUseCase:', error);
    throw error;
  } finally {
    // Quitar estado de carga
    useLevelsStore.getState().setLoading(false);
  }
}
import { SupabaseLevelAdapter } from '../../infrastructure/adapters/SupabaseLevelAdapter';
import type { Level } from '../../domain/entities/Level';

/**
 * Caso de uso para obtener todos los niveles disponibles
 * @returns Promise<Level[]> - Lista de todos los niveles
 */
export async function getLevelsUseCase(): Promise<Level[]> {
  try {
    const levels = await SupabaseLevelAdapter.getAllLevels();
    return levels;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Error al obtener los niveles: ${error.message}`
        : 'Error desconocido al obtener los niveles'
    );
  }
}

/**
 * Caso de uso para obtener un nivel específico por ID
 * @param id - ID del nivel a obtener
 * @returns Promise<Level | null> - El nivel encontrado o null si no existe
 */
export async function getLevelByIdUseCase(id: string): Promise<Level | null> {
  if (!id || typeof id !== 'string') {
    throw new Error('ID del nivel es requerido y debe ser una cadena válida');
  }

  try {
    const level = await SupabaseLevelAdapter.getLevelById(id);
    return level;
  } catch (error) {
    throw new Error(
      error instanceof Error 
        ? `Error al obtener el nivel: ${error.message}`
        : 'Error desconocido al obtener el nivel'
    );
  }
}
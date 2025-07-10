import { supabase } from '../../shared/config/supabaseClient';
import type { Level, LevelSelection } from '../../domain/entities/Level';

export const SupabaseLevelsAdapter = {
  async getLevels(): Promise<Level[]> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
      
      if (error) {
        throw new Error(`Error al obtener los levels: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error en SupabaseLevelsAdapter.getLevels:', error);
      throw error;
    }
  },

  async getLevelById(id: string): Promise<Level | null> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al obtener el level: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error en SupabaseLevelsAdapter.getLevelById:', error);
      throw error;
    }
  },

  async getLevelSelections(userId: string): Promise<LevelSelection[]> {
    try {
      const { data, error } = await supabase
        .from('select-level-topic')
        .select(`
          *,
          levels(*),
          topics(*)
        `)
        .eq('id_user', userId);
      
      if (error) {
        throw new Error(`Error al obtener las selecciones del usuario: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error en SupabaseLevelsAdapter.getLevelSelections:', error);
      throw error;
    }
  }
};
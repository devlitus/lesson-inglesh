import { supabase } from '../../shared/config/supabaseClient';
import type { Level } from '../../domain/entities/Level';

export const SupabaseLevelAdapter = {
  async getAllLevels(): Promise<Level[]> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
      
      if (error) {
        throw new Error(`Error al obtener los niveles: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener los niveles'
      );
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
        throw new Error(`Error al obtener el nivel: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener el nivel'
      );
    }
  }
};
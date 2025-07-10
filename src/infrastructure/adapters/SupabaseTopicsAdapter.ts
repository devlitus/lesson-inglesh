import { supabase } from '../../shared/config/supabaseClient';
import type { Topic } from '../../domain/entities/Topic';

export const SupabaseTopicsAdapter = {
  async getTopics(): Promise<Topic[]> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) {
        throw new Error(`Error al obtener los topics: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error en SupabaseTopicsAdapter.getTopics:', error);
      throw error;
    }
  },

  async getTopicById(id: string): Promise<Topic | null> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error al obtener el topic: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error en SupabaseTopicsAdapter.getTopicById:', error);
      throw error;
    }
  }
};
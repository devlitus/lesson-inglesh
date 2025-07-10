import { supabase } from '../../shared/config/supabaseClient';
import type { LevelSelection } from '../../domain/entities/Level';

export const SupabaseLevelTopicAdapter = {
  async createLevelTopicSelection(userId: string, levelId: string, topicId: string): Promise<LevelSelection> {
    try {
      const { data, error } = await supabase
        .from('select-level-topic')
        .insert({
          id_user: userId,
          id_level: levelId,
          id_topic: topicId
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error al crear la selección: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error en SupabaseLevelTopicAdapter.createLevelTopicSelection:', error);
      throw error;
    }
  },

  async getUserLevelTopicSelections(userId: string): Promise<LevelSelection[]> {
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
      console.error('Error en SupabaseLevelTopicAdapter.getUserLevelTopicSelections:', error);
      throw error;
    }
  },

  async deleteLevelTopicSelection(selectionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('select-level-topic')
        .delete()
        .eq('id', selectionId);
      
      if (error) {
        throw new Error(`Error al eliminar la selección: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en SupabaseLevelTopicAdapter.deleteLevelTopicSelection:', error);
      throw error;
    }
  },

  async updateLevelTopicSelection(selectionId: string, levelId?: string, topicId?: string): Promise<LevelSelection> {
    try {
      const updateData: Partial<{ id_level: string; id_topic: string }> = {};
      if (levelId) updateData.id_level = levelId;
      if (topicId) updateData.id_topic = topicId;

      const { data, error } = await supabase
        .from('select-level-topic')
        .update(updateData)
        .eq('id', selectionId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error al actualizar la selección: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error en SupabaseLevelTopicAdapter.updateLevelTopicSelection:', error);
      throw error;
    }
  }
};
import { supabase } from '../../shared/config/supabaseClient';
import type { SelectLevelTopic, CreateSelectLevelTopicInput } from '../../domain/entities/SelectLevelTopic';

export const SupabaseSelectLevelTopicAdapter = {
  /**
   * Guarda la selección de level y topic del usuario
   * @param input - Datos de la selección (id_user, id_level, id_topic)
   * @returns Promise<SelectLevelTopic> - La selección guardada
   */
  async saveSelection(input: CreateSelectLevelTopicInput): Promise<SelectLevelTopic> {
    try {
      const { data, error } = await supabase
        .from('select_level_topic')
        .upsert({
          id_user: input.id_user,
          id_level: input.id_level,
          id_topic: input.id_topic
        }, {
          onConflict: 'id_user', // Si ya existe el usuario, actualizar
          ignoreDuplicates: false // No ignorar duplicados, actualizar en su lugar
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error al guardar la selección: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al guardar la selección'
      );
    }
  },

  /**
   * Obtiene la última selección del usuario
   * @param userId - ID del usuario
   * @returns Promise<SelectLevelTopic | null> - La última selección o null si no existe
   */
  async getLastSelection(userId: string): Promise<SelectLevelTopic | null> {
    try {
      // Verificar que hay una sesión activa antes de hacer la petición
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Error de sesión: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No hay sesión activa. El usuario debe autenticarse.');
      }
      
      // Esperar un poco para asegurar que el JWT esté disponible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Sesión activa encontrada, haciendo petición a select_level_topic');
      
      const { data, error } = await supabase
        .from('select_level_topic')
        .select('*')
        .eq('id_user', userId)
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Error al obtener la selección: ${error.message}`);
      }
      
      return data || null;
    } catch (error) {
      console.error('Error en getLastSelection:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener la selección'
      );
    }
  },

  /**
   * Obtiene todas las selecciones del usuario
   * @param userId - ID del usuario
   * @returns Promise<SelectLevelTopic[]> - Lista de selecciones del usuario
   */
  async getUserSelections(userId: string): Promise<SelectLevelTopic[]> {
    try {
      const { data, error } = await supabase
        .from('select_level_topic')
        .select('*')
        .eq('id_user', userId);
      
      if (error) {
        throw new Error(`Error al obtener las selecciones: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Error desconocido al obtener las selecciones'
      );
    }
  }
};
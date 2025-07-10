import { useLevelsAutoLoad } from '../../application/hooks/useLevels';
import { useTopicsAutoLoad } from '../../application/hooks/useTopics';
import { useLevelTopicSelectionAutoLoad } from '../../application/hooks/useLevelTopicSelection';
import { useUserStore } from '../../infrastructure/store/userStore';
import type { Level } from '../../domain/entities/Level';
import type { Topic } from '../../domain/entities/Topic';

/**
 * Componente para seleccionar level y topic
 * Demuestra el uso de todos los hooks y casos de uso creados
 */
export function LevelTopicSelector() {
  const { user } = useUserStore();
  
  // Cargar automáticamente levels, topics y selecciones del usuario
  const {
    levels,
    isLoading: levelsLoading,
    error: levelsError,
    selectLevel,
    currentLevel
  } = useLevelsAutoLoad();
  
  const {
    topics,
    isLoading: topicsLoading,
    error: topicsError,
    selectTopic,
    currentTopic
  } = useTopicsAutoLoad();
  
  const {
    selections,
    isLoading: selectionsLoading,
    error: selectionsError,
    createSelection,
    deleteSelection,
    hasSelection,
  } = useLevelTopicSelectionAutoLoad(user?.id || null);

  // Manejar la selección de level
  const handleLevelSelect = (level: Level) => {
    selectLevel(level);
  };

  // Manejar la selección de topic
  const handleTopicSelect = (topic: Topic) => {
    selectTopic(topic);
  };

  // Crear una nueva selección
  const handleCreateSelection = async () => {
    if (!user || !currentLevel || !currentTopic) {
      alert('Debes seleccionar un level y un topic');
      return;
    }

    try {
      await createSelection(user.id, currentLevel.id, currentTopic.id);
      alert('Selección creada exitosamente');
    } catch (error) {
      console.error('Error al crear selección:', error);
      alert('Error al crear la selección');
    }
  };

  // Eliminar una selección
  const handleDeleteSelection = async (selectionId: string) => {
    try {
      await deleteSelection(selectionId);
      alert('Selección eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar selección:', error);
      alert('Error al eliminar la selección');
    }
  };

  if (!user) {
    return <div>Debes iniciar sesión para usar esta funcionalidad</div>;
  }

  if (levelsLoading || topicsLoading || selectionsLoading) {
    return <div>Cargando...</div>;
  }

  if (levelsError || topicsError || selectionsError) {
    return (
      <div>
        Error: {levelsError || topicsError || selectionsError}
      </div>
    );
  }

  return (
    <div className="level-topic-selector">
      <h2>Selector de Level y Topic</h2>
      
      {/* Sección de Levels */}
      <div className="section">
        <h3>Levels Disponibles</h3>
        <div className="grid">
          {levels.map((level) => (
            <div 
              key={level.id} 
              className={`card ${currentLevel?.id === level.id ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(level)}
            >
              <div className="icon">{level.icon}</div>
              <h4>{level.title}</h4>
              <p>{level.sub_title}</p>
              <p>{level.description}</p>
              <small>Features: {level.feature}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Topics */}
      <div className="section">
        <h3>Topics Disponibles</h3>
        <div className="grid">
          {topics.map((topic) => (
            <div 
              key={topic.id} 
              className={`card ${currentTopic?.id === topic.id ? 'selected' : ''}`}
              onClick={() => handleTopicSelect(topic)}
            >
              <div className="icon">{topic.icon}</div>
              <h4>{topic.title}</h4>
              <p>{topic.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón para crear selección */}
      <div className="actions">
        <button 
          onClick={handleCreateSelection}
          disabled={!currentLevel || !currentTopic || hasSelection(currentLevel?.id || '', currentTopic?.id || '')}
        >
          {hasSelection(currentLevel?.id || '', currentTopic?.id || '') 
            ? 'Ya tienes esta selección' 
            : 'Crear Selección'
          }
        </button>
      </div>

      {/* Sección de Selecciones del Usuario */}
      <div className="section">
        <h3>Tus Selecciones</h3>
        {selections.length === 0 ? (
          <p>No tienes selecciones aún</p>
        ) : (
          <div className="selections-list">
            {selections.map((selection) => {
              const selectedLevel = levels.find(level => level.id === selection.id_level);
              const selectedTopic = topics.find(topic => topic.id === selection.id_topic);
              
              return (
                <div key={selection.id} className="selection-item">
                  <div className="selection-info">
                    <strong>Level:</strong> {selectedLevel?.title || 'N/A'} <br />
                    <strong>Topic:</strong> {selectedTopic?.title || 'N/A'}
                  </div>
                  <button 
                    onClick={() => handleDeleteSelection(selection.id)}
                    className="delete-btn"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
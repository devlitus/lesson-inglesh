import { useEffect } from 'react';
import { useTopicsAutoLoad } from '../../application/hooks/useTopics';
import { useNavigation } from '../../application/hooks/useNavigation';
import type { Topic } from '../../domain/entities/Topic';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Badge, Button } from '../../design-system/components/atoms';
import { createGradientStyle } from '../../design-system/utils';
import { useSelection } from '../../infrastructure/store/selectionStore';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useLevelStore } from '../../infrastructure/store/levelStore';

interface TopicListProps {
  onTopicSelect?: (topic: Topic) => void;
  selectedTopicId?: string;
  className?: string;
}

/**
 * Componente que muestra una lista de topics disponibles
 * Utiliza el hook useTopicsAutoLoad para cargar automáticamente los datos
 */
export function TopicList({ onTopicSelect, selectedTopicId, className = '' }: TopicListProps) {
  const { topics, currentTopic, isLoading, error, selectTopic } = useTopicsAutoLoad();
  const { updateTopic, selection, updateUser } = useSelection();
  const { user } = useUserStore();
  const { selectedLevel } = useLevelStore();
  const { goToLesson } = useNavigation();

  // Sincronizar usuario cuando esté autenticado
  useEffect(() => {
    if (user?.id && !selection.user) {
      updateUser(user.id);
    }
  }, [user?.id, selection.user, updateUser]);

  // Validar correctamente: debe haber un level seleccionado, un topic seleccionado Y un usuario
  const hasCompleteSelection = !!(
    selectedLevel?.id &&           // Hay un level seleccionado en levelStore
    currentTopic?.id &&            // Hay un topic seleccionado en topicsStore  
    user?.id                       // Hay un usuario autenticado
  );

  const handleTopicClick = (topic: Topic) => {
    selectTopic(topic);
    updateTopic(topic.id); // Actualizar el selectionStore
    onTopicSelect?.(topic);
  };

  const handleGoToLesson = () => {
    goToLesson();
  };

  if (isLoading) {
    return (
      <div className={`topics-list ${className}`}>
        <div className="loading-state">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Cargando topics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`topics-list ${className}`}>
        <div className="error-state">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">Error al cargar topics</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className={`topics-list ${className}`}>
        <div className="empty-state">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 font-medium">No hay topics disponibles</p>
            <p className="text-gray-500 text-sm mt-1">Los topics aparecerán aquí cuando estén disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`topics-list ${className}`}>
      <div className="grid grid-cols-3 gap-5">
        {topics.length > 0 && topics.map((topic) => {
          const isSelected = selectedTopicId === topic.id || currentTopic?.id === topic.id;
          
          return (
            <Card
              key={topic.id}
              variant="elevated"
              size="md"
              clickable
              onClick={() => handleTopicClick(topic)}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : ''
              }`}
            
            >
              {/* Badge de selección */}
              {isSelected && (
                <Badge
                  variant="success"
                  size="sm"
                  shape="pill"
                  leftIcon="✅"
                  className="absolute top-2 right-2 z-10 shadow-md"
                >
                  SELECTED
                </Badge>
              )}
              
              <CardHeader className="text-center">
                {topic.icon && (
                  <div 
                    className="text-3xl mb-2 drop-shadow-sm"
                    style={{ 
                      color: topic.color_scheme || '#6b7280',
                      filter: 'brightness(0.8)'
                    }}
                  >
                    {topic.icon}
                  </div>
                )}
                <CardTitle level={4} className="text-gray-900">
                  {topic.title}
                </CardTitle>
              </CardHeader>
              
              {topic.description && (
                <CardBody>
                  <CardDescription className="text-gray-600 text-sm text-center">
                    {topic.description}
                  </CardDescription>
                </CardBody>
              )}
              
              {/* Indicador visual del color scheme con degradado */}
              {topic.color_scheme && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2 rounded-b-lg opacity-80"
                  style={createGradientStyle(topic.color_scheme, 'to-r', 'medium')}
                />
              )}
            </Card>
          );
        })}
      </div>

      {/* Botón para ir a las lecciones */}
      <div className="mt-8 text-center">
        <Button
          onClick={handleGoToLesson}
          variant="primary"
          size="lg"
          disabled={!hasCompleteSelection}
          className={`font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-200 ${
            hasCompleteSelection
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          📚 Generar lección
        </Button>
        {!hasCompleteSelection && (
          <p className="text-sm text-gray-500 mt-2">
            Selecciona un nivel y un topic para generar una lección
          </p>
        )}
      </div>
    </div>
  );
}


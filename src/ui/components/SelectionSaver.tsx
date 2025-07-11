import { useEffect, useState } from 'react';
import { useSelectLevelTopic } from '../../application/hooks/useSelectLevelTopic';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useSelection } from '../../infrastructure/store/selectionStore';
import { useNavigation } from "../../application/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Button } from '../../design-system/components/atoms';
import { generateLessonUseCase, getLessonByUserLevelTopicUseCase } from '../../application/use-cases';

/**
 * Componente simplificado para guardar la selección de Level y Topic
 */
export function SelectionSaver() {
  const { user, isAuthenticated } = useUserStore();
  const { level, topic, hasCompleteSelection, updateUser } = useSelection();
  const { saveSelection, isLoading } = useSelectLevelTopic();
  const { goToLesson } = useNavigation();
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Sincronizar el usuario en el selectionStore cuando cambie
  useEffect(() => {
    if (user?.id) {
      updateUser(user.id);
    }
  }, [user?.id, updateUser]);

  const handleSaveSelection = async () => {
    if (level && topic && user) {
      try {
        setGenerationError(null);
        setIsGeneratingLesson(true);

        // Crear objetos mock para mantener compatibilidad con el hook existente
        const levelObj = { id: level, title: '', sub_title: '', description: '', feature: '', icon: '', color_scheme: '' };
        const topicObj = { id: topic, title: '', description: '', icon: '', color_scheme: '' };
        
        // Guardar la selección primero
        await saveSelection(levelObj, topicObj);

        // Verificar si ya existe una lección para esta combinación
        const existingLesson = await getLessonByUserLevelTopicUseCase(user.id, level, topic);
        
        if (!existingLesson) {
          // Generar nueva lección con Gemini AI
          console.log('Generando nueva lección con Gemini AI...');
          await generateLessonUseCase({ userId: user.id, levelId: level, topicId: topic });
          console.log('Lección generada exitosamente');
        } else {
          console.log('Lección existente encontrada, reutilizando...');
        }

        // Navegar a la lección
        goToLesson();
      } catch (error) {
        console.error('Error al generar lección:', error);
        setGenerationError(error instanceof Error ? error.message : 'Error desconocido al generar la lección');
        // Aún así navegar a la lección, ya que la selección se guardó
        goToLesson();
      } finally {
        setIsGeneratingLesson(false);
      }
    }
  };

  const canSave = isAuthenticated && hasCompleteSelection;
  const isProcessing = isLoading || isGeneratingLesson;

  if (!isAuthenticated) return null;

  const getButtonText = () => {
    if (isLoading) return 'Guardando...';
    if (isGeneratingLesson) return 'Generando lección...';
    return 'Guardar y Generar Lección';
  };

  return (
    <Card variant="outlined" size="lg" className="h-fit">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{isGeneratingLesson ? '🤖' : '💾'}</div>
          <div>
            <CardTitle level={2} className="text-gray-900">
              {isGeneratingLesson ? 'Generando Lección' : 'Guardar Selección'}
            </CardTitle>
            <CardDescription>
              {isGeneratingLesson 
                ? 'Creando contenido personalizado con IA...' 
                : 'Guarda tu combinación y genera lección con IA'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        {generationError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              ⚠️ {generationError}
            </p>
          </div>
        )}
        
        <Button
          onClick={handleSaveSelection}
          disabled={!canSave || isProcessing}
          variant={canSave ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
        >
          {getButtonText()}
        </Button>
        
        {isGeneratingLesson && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Esto puede tomar unos momentos...</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default SelectionSaver;
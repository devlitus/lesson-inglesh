import { useEffect } from 'react';
import { useSelectLevelTopic } from '../../application/hooks/useSelectLevelTopic';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useSelection } from '../../infrastructure/store/selectionStore';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Button } from '../../design-system/components/atoms';

/**
 * Componente simplificado para guardar la selección de Level y Topic
 */
export function SelectionSaver() {
  const { user, isAuthenticated } = useUserStore();
  const { level, topic, hasCompleteSelection, updateUser } = useSelection();
  const { saveSelection, isLoading } = useSelectLevelTopic();

  // Sincronizar el usuario en el selectionStore cuando cambie
  useEffect(() => {
    if (user?.id) {
      updateUser(user.id);
    }
  }, [user?.id, updateUser]);

  const handleSaveSelection = async () => {
    if (level && topic && user) {
      // Crear objetos mock para mantener compatibilidad con el hook existente
      const levelObj = { id: level, title: '', sub_title: '', description: '', feature: '', icon: '', color_scheme: '' };
      const topicObj = { id: topic, title: '', description: '', icon: '', color_scheme: '' };
      await saveSelection(levelObj, topicObj);
    }
  };

  const canSave = isAuthenticated && hasCompleteSelection;

  if (!isAuthenticated) return null;

  return (
    <Card variant="outlined" size="lg" className="h-fit">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">💾</div>
          <div>
            <CardTitle level={2} className="text-gray-900">
              Guardar Selección
            </CardTitle>
            <CardDescription>
              Guarda tu combinación preferida
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <Button
          onClick={handleSaveSelection}
          disabled={!canSave || isLoading}
          variant={canSave ? 'primary' : 'secondary'}
          size="md"
          className="w-full"
        >
          {isLoading ? 'Guardando...' : 'Guardar Selección'}
        </Button>
      </CardBody>
    </Card>
  );
}

export default SelectionSaver;
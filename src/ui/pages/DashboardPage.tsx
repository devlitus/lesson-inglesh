import React from 'react';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useLevelsAutoLoad } from '../../application/hooks/useLevels';
import { useTopicsAutoLoad } from '../../application/hooks/useTopics';
import { useLevelTopicSelectionAutoLoad } from '../../application/hooks/useLevelTopicSelection';
import { logoutUseCase } from '../../application/use-cases/logout';
import { AuthError } from '../../domain/entities/AuthError';
import type { LevelWithProgress } from '../../domain/entities/Level';
import type { TopicWithSelection } from '../../domain/entities/Topic';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Button } from '../../design-system';
import { cn } from '../../design-system/utils/cn';

export function Dashboard() {
  const { user, isLoading: userLoading } = useUserStore();
  const { 
    levels, 
    currentLevel, 
    isLoading: levelsLoading, 
    error: levelsError,
    selectLevel 
  } = useLevelsAutoLoad();
  console.log({levels})
  const { 
    topics, 
    isLoading: topicsLoading, 
    error: topicsError,
    selectTopic 
  } = useTopicsAutoLoad();
  const { 
    selections, 

    error: selectionsError,
  } = useLevelTopicSelectionAutoLoad(user?.id || null);
  
  const [error, setError] = React.useState<string | null>(null);

  // Combinar levels con información de progreso (esto podría venir de otro store o API)
  const levelsWithProgress: LevelWithProgress[] = React.useMemo(() => {
    return levels.map(level => ({
      ...level,
      progress: Math.floor(Math.random() * 100), // Temporal: reemplazar con datos reales
      isCompleted: false,
      unlockedAt: new Date().toISOString()
    }));
  }, [levels]);

  // Combinar topics con información de selección
  const topicsWithSelection: TopicWithSelection[] = React.useMemo(() => {
    return topics.map(topic => {
      const selection = selections.find(s => s.id_topic === topic.id);
      return {
        ...topic,
        isSelected: !!selection,
        selectionId: selection?.id
      };
    });
  }, [topics, selections]);

  const handleLogout = async () => {
    try {
      setError(null);
      await logoutUseCase();
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Error al cerrar sesión');
      }
    }
  };

  const handleLevelSelect = (levelId: string) => {
    const selectedLevel = levels.find(level => level.id === levelId);
    if (selectedLevel) {
      selectLevel(selectedLevel);
    }
  };

  const handleTopicSelect = (topicId: string) => {
    const selectedTopic = topics.find(topic => topic.id === topicId);
    if (selectedTopic) {
      selectTopic(selectedTopic);
    }
  };

  
  // Errores combinados
  const combinedError = error || levelsError || topicsError || selectionsError;

  const getColorClasses = (colorScheme: string, type: 'bg' | 'border' | 'text' = 'bg') => {
    const colorMap = {
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-green-200',
        text: 'text-green-700'
      },
      blue: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-700'
      },
      purple: {
        bg: 'bg-purple-50 hover:bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-700'
      },
      orange: {
        bg: 'bg-orange-50 hover:bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-700'
      },
      red: {
        bg: 'bg-red-50 hover:bg-red-100',
        border: 'border-red-200',
        text: 'text-red-700'
      },
      indigo: {
        bg: 'bg-indigo-50 hover:bg-indigo-100',
        border: 'border-indigo-200',
        text: 'text-indigo-700'
      },
      yellow: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        border: 'border-yellow-200',
        text: 'text-yellow-700'
      }
    };
    return colorMap[colorScheme as keyof typeof colorMap]?.[type] || colorMap.blue[type];
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lesson Inglesh</h1>
              <p className="text-sm text-gray-600">¡Bienvenido, {user.name}!</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={userLoading}
            >
              {userLoading ? 'Cerrando...' : 'Cerrar Sesión'}
            </Button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {combinedError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{combinedError}</p>
          </div>
        </div>
      )}


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Levels Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Niveles de Aprendizaje</h2>
            <p className="text-gray-600">Selecciona tu nivel actual para comenzar tu aprendizaje</p>
          </div>
          
          {levelsWithProgress.length === 0 && !levelsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay niveles disponibles</p>
              <p className="text-gray-400 text-sm mt-2">Los niveles se cargarán automáticamente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelsWithProgress.map((level) => (
              <Card
                key={level.id}
                variant="elevated"
                clickable
                onClick={() => handleLevelSelect(level.id)}
                className={cn(
                   'transition-all duration-200 hover:scale-105',
                   getColorClasses(level.color_scheme, 'bg'),
                   getColorClasses(level.color_scheme, 'border'),
                   currentLevel?.id === level.id && 'ring-2 ring-blue-500 ring-offset-2'
                 )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{level.icon}</span>
                    <div>
                      <CardTitle className={getColorClasses(level.color_scheme, 'text')}>
                        {level.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {level.sub_title}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody>
                  <p className="text-gray-700 mb-4">{level.description}</p>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Progreso</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          level.color_scheme === 'green' && 'bg-green-500',
                          level.color_scheme === 'blue' && 'bg-blue-500',
                          level.color_scheme === 'purple' && 'bg-purple-500'
                        )}
                        style={{ width: `${level.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{level.progress}% completado</p>
                  </div>
                  <div className={cn(
                    'text-sm px-3 py-1 rounded-full inline-block',
                    getColorClasses(level.color_scheme, 'bg'),
                    getColorClasses(level.color_scheme, 'text')
                  )}>
                    {level.feature}
                  </div>
                </CardBody>
              </Card>
               ))}
             </div>
           )}
         </section>

        {/* Topics Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Temas de Estudio</h2>
            <p className="text-gray-600">Explora diferentes temas para practicar tu inglés</p>
          </div>
          
          {topicsWithSelection.length === 0 && !topicsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay temas disponibles</p>
              <p className="text-gray-400 text-sm mt-2">Los temas se cargarán automáticamente</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {topicsWithSelection.map((topic) => (
              <Card
                key={topic.id}
                variant="outlined"
                clickable
                onClick={() => handleTopicSelect(topic.id)}
                className={cn(
                  'transition-all duration-200 hover:scale-105',
                  getColorClasses(topic.color_scheme || 'blue', 'bg'),
                  getColorClasses(topic.color_scheme || 'blue', 'border'),
                  topic.isSelected && 'ring-2 ring-green-500 ring-offset-2'
                )}
                size="sm"
              >
                <CardBody>
                  <div className="text-center">
                    <div className="text-4xl mb-3">{topic.icon}</div>
                    <h3 className={cn(
                      'font-semibold text-sm mb-2',
                      getColorClasses(topic.color_scheme || 'blue', 'text')
                    )}>
                      {topic.title}
                    </h3>
                    {topic.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {topic.description}
                      </p>
                    )}
                    {topic.isSelected && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
               ))}
             </div>
           )}
         </section>
       </main>
     </div>
   );
 }

export default Dashboard;
import { useEffect, useState } from 'react';
import { useUserStore } from '../../infrastructure/store/userStore';
import { useSelection } from '../../infrastructure/store/selectionStore';
import { getLessonByUserLevelTopicUseCase } from '../../application/use-cases';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from '../../design-system/components/molecules';
import { Button } from '../../design-system/components/atoms';
import type { LessonContent } from '../../domain/entities/LessonContent';
import type { VocabularyItem } from '../../domain/entities/Vocabulary';
import type { GrammarConcept } from '../../domain/entities/Grammar';
import type { Exercise } from '../../domain/entities/Exercise';

interface LessonViewerProps {
  lessonId?: string;
}

export function LessonViewer({ lessonId }: LessonViewerProps) {
  const { user } = useUserStore();
  const { level, topic } = useSelection();
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'exercises'>('vocabulary');

  useEffect(() => {
    const loadLessonContent = async () => {
      if (!user?.id || !level || !topic) {
        setError('Información de usuario, nivel o tema no disponible');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const content = await getLessonByUserLevelTopicUseCase(user.id, level, topic);
        setLessonContent(content);
      } catch (err) {
        console.error('Error al cargar contenido de lección:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar la lección');
      } finally {
        setIsLoading(false);
      }
    };

    loadLessonContent();
  }, [user?.id, level, topic, lessonId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" size="lg" className="max-w-2xl mx-auto">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar la lección</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Reintentar
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!lessonContent) {
    return (
      <Card variant="outlined" size="lg" className="max-w-2xl mx-auto">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay lección disponible</h3>
            <p className="text-gray-600">No se encontró contenido para esta combinación de nivel y tema.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const { lesson, vocabulary, grammar, exercises } = lessonContent;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header de la lección */}
      <Card variant="outlined" size="lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎓</div>
            <div>
              <CardTitle level={1} className="text-gray-900">
                {lesson.title}
              </CardTitle>
              <CardDescription>
                Nivel: {lesson.levelId} • Tema: {lesson.topicId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {lesson.description && (
          <CardBody>
            <p className="text-gray-700">{lesson.description}</p>
          </CardBody>
        )}
      </Card>

      {/* Navegación por pestañas */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'vocabulary'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 Vocabulario ({vocabulary.length})
        </button>
        <button
          onClick={() => setActiveTab('grammar')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'grammar'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📖 Gramática ({grammar.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'exercises'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Ejercicios ({exercises.length})
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'vocabulary' && (
        <VocabularySection vocabulary={vocabulary} />
      )}
      
      {activeTab === 'grammar' && (
        <GrammarSection grammar={grammar} />
      )}
      
      {activeTab === 'exercises' && (
        <ExercisesSection exercises={exercises} />
      )}
    </div>
  );
}

// Componente para la sección de vocabulario
function VocabularySection({ vocabulary }: { vocabulary: VocabularyItem[] }) {
  if (vocabulary.length === 0) {
    return (
      <Card variant="outlined" size="lg">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600">No hay vocabulario disponible para esta lección.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {vocabulary.map((item) => (
        <Card key={item.id} variant="outlined" size="md">
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{item.word}</h3>
                <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {item.partOfSpeech}
                </span>
              </div>
              
              {item.pronunciation && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pronunciación:</span> /{item.pronunciation}/
                </p>
              )}
              
              <p className="text-gray-700">
                <span className="font-medium">Traducción:</span> {item.translation}
              </p>
              
              {item.definition && (
                <p className="text-gray-700">
                  <span className="font-medium">Definición:</span> {item.definition}
                </p>
              )}
              
              {item.example && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Ejemplo:</span> {item.example}
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// Componente para la sección de gramática
function GrammarSection({ grammar }: { grammar: GrammarConcept[] }) {
  if (grammar.length === 0) {
    return (
      <Card variant="outlined" size="lg">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📖</div>
            <p className="text-gray-600">No hay conceptos de gramática disponibles para esta lección.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {grammar.map((concept) => (
        <Card key={concept.id} variant="outlined" size="lg">
          <CardHeader>
            <CardTitle level={2} className="text-gray-900">
              {concept.title}
            </CardTitle>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              <p className="text-gray-700">{concept.explanation}</p>
              
              {concept.rule && (
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-900 mb-2">Regla:</h4>
                  <p className="text-blue-800">{concept.rule}</p>
                </div>
              )}
              
              {concept.examples && concept.examples.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ejemplos:</h4>
                  <ul className="space-y-1">
                    {concept.examples.map((example, index) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {concept.commonMistakes && concept.commonMistakes.length > 0 && (
                <div className="bg-red-50 p-4 rounded-md">
                  <h4 className="font-medium text-red-900 mb-2">Errores comunes:</h4>
                  <ul className="space-y-1">
                    {concept.commonMistakes.map((mistake, index) => (
                      <li key={index} className="text-red-800 flex items-start">
                        <span className="text-red-600 mr-2">⚠️</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {concept.tips && concept.tips.length > 0 && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="font-medium text-green-900 mb-2">Consejos:</h4>
                  <ul className="space-y-1">
                    {concept.tips.map((tip, index) => (
                      <li key={index} className="text-green-800 flex items-start">
                        <span className="text-green-600 mr-2">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// Componente para la sección de ejercicios
function ExercisesSection({ exercises }: { exercises: Exercise[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  if (exercises.length === 0) {
    return (
      <Card variant="outlined" size="lg">
        <CardBody>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-600">No hay ejercicios disponibles para esta lección.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const handleAnswerSelect = (exerciseId: string, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: answer }));
  };

  const handleCheckAnswer = (exerciseId: string) => {
    setShowResults(prev => ({ ...prev, [exerciseId]: true }));
  };

  const resetExercise = (exerciseId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: '' }));
    setShowResults(prev => ({ ...prev, [exerciseId]: false }));
  };

  return (
    <div className="space-y-6">
      {exercises.map((exercise, index) => {
        const selectedAnswer = selectedAnswers[exercise.id] || '';
        const showResult = showResults[exercise.id] || false;
        const isCorrect = selectedAnswer === exercise.correctAnswer;

        return (
          <Card key={exercise.id} variant="outlined" size="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle level={3} className="text-gray-900">
                  Ejercicio {index + 1}
                </CardTitle>
                <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {exercise.type}
                </span>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                <p className="text-gray-900 font-medium">{exercise.question}</p>
                
                {exercise.options && exercise.options.length > 0 && (
                  <div className="space-y-2">
                    {exercise.options.map((option, optionIndex) => {
                      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                      const isSelected = selectedAnswer === optionLetter;
                      const isCorrectOption = exercise.correctAnswer === optionLetter;
                      
                      let optionClass = 'p-3 border rounded-md cursor-pointer transition-colors ';
                      
                      if (showResult) {
                        if (isCorrectOption) {
                          optionClass += 'bg-green-100 border-green-300 text-green-800';
                        } else if (isSelected && !isCorrect) {
                          optionClass += 'bg-red-100 border-red-300 text-red-800';
                        } else {
                          optionClass += 'bg-gray-50 border-gray-200 text-gray-600';
                        }
                      } else {
                        if (isSelected) {
                          optionClass += 'bg-blue-100 border-blue-300 text-blue-800';
                        } else {
                          optionClass += 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50';
                        }
                      }
                      
                      return (
                        <div
                          key={optionIndex}
                          className={optionClass}
                          onClick={() => !showResult && handleAnswerSelect(exercise.id, optionLetter)}
                        >
                          <span className="font-medium mr-2">{optionLetter}.</span>
                          {option}
                          {showResult && isCorrectOption && (
                            <span className="ml-2 text-green-600">✓</span>
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <span className="ml-2 text-red-600">✗</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  {!showResult ? (
                    <Button
                      onClick={() => handleCheckAnswer(exercise.id)}
                      disabled={!selectedAnswer}
                      variant={selectedAnswer ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      Verificar Respuesta
                    </Button>
                  ) : (
                    <Button
                      onClick={() => resetExercise(exercise.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Reintentar
                    </Button>
                  )}
                </div>
                
                {showResult && exercise.explanation && (
                  <div className={`p-4 rounded-md ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      isCorrect ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      {isCorrect ? '¡Correcto! 🎉' : 'Explicación:'}
                    </h4>
                    <p className={isCorrect ? 'text-green-800' : 'text-blue-800'}>
                      {exercise.explanation}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

export default LessonViewer;
// Casos de uso de autenticación
export { initializeAuthUseCase } from './initializeAuth';
export { signInUseCase } from './signIn';
export { signUpUseCase } from './signUp';
export { logoutUseCase } from './logout';

// Casos de uso de levels
export { getLevelsUseCase, getLevelByIdUseCase } from './getLevels';

// Casos de uso de topics
export { getTopicsUseCase, getTopicByIdUseCase } from './getTopics';

// Casos de uso de selección de level y topic
export { 
  saveSelectLevelTopicUseCase, 
  getLastSelectLevelTopicUseCase, 
  getUserSelectLevelTopicUseCase 
} from './saveSelectLevelTopic';

// Casos de uso de verificación de selección
export { 
  checkUserSelectionUseCase, 
  hasUserSelectionUseCase 
} from './checkUserSelection';

// Casos de uso de generación de lecciones con Gemini AI
export {
  generateLessonUseCase,
  getLessonContentUseCase,
  getLessonByUserLevelTopicUseCase
} from './generateLesson';

// Casos de uso de generación de vocabulario
export {
  generateVocabularyUseCase,
  getVocabularyByLessonUseCase,
  regenerateVocabularyUseCase,
  previewVocabularyUseCase
} from './generateVocabulary';

// Casos de uso de generación de gramática
export {
  generateGrammarUseCase,
  getGrammarByLessonUseCase,
  regenerateGrammarUseCase,
  previewGrammarUseCase,
  getGrammarConceptUseCase
} from './generateGrammar';

// Casos de uso de generación de ejercicios
export {
  generateExercisesUseCase,
  getExercisesByLessonUseCase,
  regenerateExercisesUseCase,
  previewExercisesUseCase,
  getExercisesByTypeUseCase,
  validateExerciseAnswerUseCase
} from './generateExercises';
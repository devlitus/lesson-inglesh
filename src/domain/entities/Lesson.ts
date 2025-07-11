export interface Lesson {
  id: string;
  userId: string;
  levelId: string;
  topicId: string;
  title: string;
  description: string;
  estimatedDuration: number; // en minutos
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: 'generating' | 'ready' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonInput {
  userId: string;
  levelId: string;
  topicId: string;
  title: string;
  description: string;
  estimatedDuration: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
}
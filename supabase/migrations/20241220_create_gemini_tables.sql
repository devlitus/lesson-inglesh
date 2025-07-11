-- Migración para crear las tablas necesarias para la integración con Gemini AI
-- Fecha: 2024-12-20
-- Descripción: Tablas para lecciones, vocabulario, gramática y ejercicios

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_duration INTEGER DEFAULT 30, -- en minutos
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
  status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vocabulario
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  pronunciation VARCHAR(200),
  translation VARCHAR(200) NOT NULL,
  definition TEXT NOT NULL,
  example TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
  part_of_speech VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gramática
CREATE TABLE IF NOT EXISTS grammar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  explanation TEXT NOT NULL,
  rule TEXT NOT NULL,
  examples TEXT[] NOT NULL DEFAULT '{}',
  common_mistakes TEXT[] NOT NULL DEFAULT '{}',
  tips TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL DEFAULT '{}',
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_level_topic ON lessons(level_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON vocabulary(lesson_id);
CREATE INDEX IF NOT EXISTS idx_grammar_lesson_id ON grammar(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);

-- Índice único para evitar lecciones duplicadas por usuario/nivel/tema
CREATE UNIQUE INDEX IF NOT EXISTS idx_lessons_unique_user_level_topic 
ON lessons(user_id, level_id, topic_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en la tabla lessons
CREATE TRIGGER update_lessons_updated_at 
  BEFORE UPDATE ON lessons 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Política para lessons: los usuarios solo pueden ver/modificar sus propias lecciones
CREATE POLICY "Users can view their own lessons" ON lessons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lessons" ON lessons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons" ON lessons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons" ON lessons
  FOR DELETE USING (auth.uid() = user_id);

-- Política para vocabulary: acceso a través de la lección del usuario
CREATE POLICY "Users can view vocabulary from their lessons" ON vocabulary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = vocabulary.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert vocabulary to their lessons" ON vocabulary
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = vocabulary.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vocabulary from their lessons" ON vocabulary
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = vocabulary.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vocabulary from their lessons" ON vocabulary
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = vocabulary.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Política para grammar: acceso a través de la lección del usuario
CREATE POLICY "Users can view grammar from their lessons" ON grammar
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = grammar.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert grammar to their lessons" ON grammar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = grammar.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update grammar from their lessons" ON grammar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = grammar.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete grammar from their lessons" ON grammar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = grammar.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Política para exercises: acceso a través de la lección del usuario
CREATE POLICY "Users can view exercises from their lessons" ON exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = exercises.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert exercises to their lessons" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = exercises.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises from their lessons" ON exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = exercises.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises from their lessons" ON exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lessons 
      WHERE lessons.id = exercises.lesson_id 
      AND lessons.user_id = auth.uid()
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE lessons IS 'Tabla principal de lecciones generadas por Gemini AI';
COMMENT ON TABLE vocabulary IS 'Vocabulario asociado a cada lección';
COMMENT ON TABLE grammar IS 'Conceptos de gramática asociados a cada lección';
COMMENT ON TABLE exercises IS 'Ejercicios asociados a cada lección';

COMMENT ON COLUMN lessons.status IS 'Estado de la lección: generating, ready, error';
COMMENT ON COLUMN lessons.difficulty IS 'Dificultad de 1 a 5';
COMMENT ON COLUMN lessons.estimated_duration IS 'Duración estimada en minutos';
COMMENT ON COLUMN vocabulary.part_of_speech IS 'Tipo de palabra: noun, verb, adjective, etc.';
COMMENT ON COLUMN exercises.type IS 'Tipo de ejercicio: multiple_choice, fill_blank, translation, etc.';
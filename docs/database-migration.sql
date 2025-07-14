-- ===========================================
-- MIGRACIÓN PARA USAR SOLO public.users
-- ===========================================

-- 1. Crear tabla users si no existe (con campo password)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla user_sessions para manejar sesiones
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Un usuario solo puede tener una sesión activa
);

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- 4. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Trigger para actualizar updated_at en users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS (Row Level Security) para seguridad
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de seguridad para users
-- Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (true); -- Permitir lectura para la aplicación

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (true); -- Permitir actualización para la aplicación

CREATE POLICY "Users can insert" ON public.users
    FOR INSERT WITH CHECK (true); -- Permitir inserción para registro

-- 8. Políticas de seguridad para user_sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (true); -- Permitir todas las operaciones para la aplicación

-- 9. Migrar datos existentes si hay usuarios en auth.users
-- NOTA: Ejecutar solo si tienes datos existentes que migrar
-- INSERT INTO public.users (id, email, name, created_at)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'name', email_split[1]) as name,
--   created_at
-- FROM auth.users,
--      LATERAL string_to_array(email, '@') AS email_split
-- ON CONFLICT (id) DO NOTHING;

-- 10. Limpiar tablas relacionadas con auth si existen
-- DROP TABLE IF EXISTS public.user_token; -- Eliminar tabla anterior si existe

-- ===========================================
-- VERIFICACIÓN DE LA MIGRACIÓN
-- ===========================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'user_sessions')
ORDER BY table_name, ordinal_position;

-- Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'user_sessions');
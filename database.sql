-- ============================================================
-- CLOUDSOFT — Esquema completo para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- EXTENSIONES
-- ══════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ══════════════════════════════════════════════════════════════
-- TABLA: usuarios
-- Se sincroniza automáticamente con auth.users via trigger
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.usuarios (
  id            UUID PRIMARY KEY,              -- Mismo UUID que auth.users
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL DEFAULT 'SUPABASE_AUTH',
  nombre        VARCHAR(100) NOT NULL,
  rol           VARCHAR(30)  NOT NULL DEFAULT 'operador',
  avatar_url    TEXT,
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- FUNCIÓN + TRIGGER: sincronizar auth.users → public.usuarios
-- Cada vez que creas un usuario en Supabase Authentication,
-- se inserta automáticamente en la tabla usuarios
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username  TEXT;
  v_nombre    TEXT;
BEGIN
  -- Extraer username del email (parte antes del @)
  v_username := split_part(NEW.email, '@', 1);

  -- Intentar obtener nombre de los metadatos del usuario
  v_nombre := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    v_username
  );

  -- Insertar en tabla usuarios (ignorar si ya existe)
  INSERT INTO public.usuarios (id, username, email, password_hash, nombre, rol, activo)
  VALUES (
    NEW.id,
    v_username,
    NEW.email,
    'SUPABASE_AUTH',  -- Contraseña manejada por Supabase Auth
    v_nombre,
    'operador',       -- Rol por defecto (cambiar manualmente si necesitas admin)
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Eliminar trigger si ya existe (para poder re-ejecutar el script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger que se dispara al crear un usuario en Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ══════════════════════════════════════════════════════════════
-- FUNCIÓN: actualizar updated_at automáticamente
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_usuarios
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- TABLA: movimientos
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.movimientos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo         VARCHAR(30) UNIQUE NOT NULL,
  tipo           VARCHAR(30) NOT NULL,
  concepto       TEXT        NOT NULL,
  monto          NUMERIC(14,2) NOT NULL DEFAULT 0,
  moneda         VARCHAR(5)  NOT NULL DEFAULT 'PEN',
  fecha          DATE        NOT NULL DEFAULT CURRENT_DATE,
  estado         VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  referencia     VARCHAR(100),
  usuario_id     UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  observaciones  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at_movimientos
  BEFORE UPDATE ON public.movimientos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- TABLA: liquidaciones
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.liquidaciones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo          VARCHAR(30) UNIQUE NOT NULL,
  periodo         VARCHAR(20) NOT NULL,
  descripcion     TEXT,
  total_ingresos  NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_egresos   NUMERIC(14,2) NOT NULL DEFAULT 0,
  saldo           NUMERIC(14,2) GENERATED ALWAYS AS (total_ingresos - total_egresos) STORED,
  estado          VARCHAR(20) NOT NULL DEFAULT 'borrador',
  fecha_inicio    DATE,
  fecha_fin       DATE,
  aprobado_por    UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  aprobado_en     TIMESTAMPTZ,
  usuario_id      UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at_liquidaciones
  BEFORE UPDATE ON public.liquidaciones
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- TABLA: configuracion
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.configuracion (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave       VARCHAR(100) UNIQUE NOT NULL,
  valor       TEXT,
  descripcion TEXT,
  editable    BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
  ('empresa_nombre',     'CLOUDSOFT',      'Nombre de la empresa'),
  ('empresa_ruc',        '00000000000',    'RUC de la empresa'),
  ('moneda_principal',   'PEN',            'Moneda principal'),
  ('zona_horaria',       'America/Lima',   'Zona horaria')
ON CONFLICT (clave) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion  ENABLE ROW LEVEL SECURITY;

-- Política: el service_role (tu servidor Node.js) puede hacer todo
CREATE POLICY "allow_service_role_all_usuarios"
  ON public.usuarios FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all_movimientos"
  ON public.movimientos FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all_liquidaciones"
  ON public.liquidaciones FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "allow_service_role_all_configuracion"
  ON public.configuracion FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Política adicional: anon también puede leer/escribir usuarios
-- (necesario porque el login usa la anon key)
CREATE POLICY "allow_anon_select_usuarios"
  ON public.usuarios FOR SELECT TO anon USING (true);

CREATE POLICY "allow_anon_insert_usuarios"
  ON public.usuarios FOR INSERT TO anon WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- SINCRONIZAR USUARIOS EXISTENTES EN AUTH → TABLA usuarios
-- Ejecutar esto si ya tienes usuarios creados en Authentication
-- ══════════════════════════════════════════════════════════════
INSERT INTO public.usuarios (id, username, email, password_hash, nombre, rol, activo)
SELECT
  au.id,
  split_part(au.email, '@', 1) AS username,
  au.email,
  'SUPABASE_AUTH',
  COALESCE(
    au.raw_user_meta_data->>'nombre',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) AS nombre,
  'operador',
  TRUE
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.usuarios u WHERE u.id = au.id
);

-- ══════════════════════════════════════════════════════════════
-- CAMBIAR ROL A ADMIN (ejecutar después de crear tu usuario)
-- Reemplaza 'tu@email.com' con tu correo real
-- ══════════════════════════════════════════════════════════════
-- UPDATE public.usuarios SET rol = 'admin' WHERE email = 'tu@email.com';

-- ══════════════════════════════════════════════════════════════
-- RESUMEN:
-- ✅ Tabla usuarios sincronizada con auth.users via trigger
-- ✅ Crear usuario en Authentication → aparece en tabla usuarios
-- ✅ RLS configurado para anon key y service_role
-- ✅ Login funciona con email o username
-- ══════════════════════════════════════════════════════════════

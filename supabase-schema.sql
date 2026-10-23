-- Invitados cargados por el admin
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  allows_companion BOOLEAN DEFAULT false,
  -- Lista cerrada: acompañantes pre-definidos por el admin
  locked_companions JSONB DEFAULT '[]',
  -- Acompañantes adicionales libres
  max_adults INTEGER DEFAULT 0,
  adult_cost DECIMAL(10,2) DEFAULT 0,
  max_over12 INTEGER DEFAULT 0,     -- mayores de 12 años
  over12_cost DECIMAL(10,2) DEFAULT 0,
  max_under12 INTEGER DEFAULT 0,    -- menores de 12 años
  under12_cost DECIMAL(10,2) DEFAULT 0,
  phrase_type TEXT DEFAULT 'friends',
  custom_phrase TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT now()
);

-- Confirmaciones hechas por los invitados
CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  dni TEXT,
  adult_count INTEGER DEFAULT 0,
  over12_count INTEGER DEFAULT 0,
  under12_count INTEGER DEFAULT 0,
  under5_count INTEGER DEFAULT 0,
  companions JSONB DEFAULT '[]',
  main_menu TEXT DEFAULT 'Ninguno',
  total_cost DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP DEFAULT now()
);

-- Para bases existentes, agregar las columnas con:
-- ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;
-- ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS under5_count INTEGER DEFAULT 0;
-- ALTER TABLE confirmations ADD COLUMN IF NOT EXISTS main_menu TEXT DEFAULT 'Ninguno';

-- Índice para búsqueda por nombre
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE INDEX idx_guests_full_name ON guests USING gin(to_tsvector('spanish', full_name));

-- Datos de prueba
INSERT INTO guests (full_name, allows_companion, locked_companions, phrase_type) VALUES
  ('Enzo Casalegno', true, '[]', 'friends'),
  ('Diego Fornero', false, '[{"name":"María Fornero","type":"adult"},{"name":"Ana Fornero","type":"under12"}]', 'family');

-- Configuración editable desde el admin
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO settings (key, value) VALUES
  ('bride_name', ''),
  ('groom_name', ''),
  ('wedding_date', ''),
  ('venue_name', ''),
  ('venue_address', ''),
  ('venue_maps_url', ''),
  ('venue_maps_embed', ''),
  ('cbu_ars', ''),
  ('alias_ars', ''),
  ('holder_ars', ''),
  ('cbu_usd', ''),
  ('alias_usd', ''),
  ('holder_usd', ''),
  ('accommodations', '[]'),
  ('main_photo', ''),
  ('gallery_photos', '[]'),
  ('gallery_title', 'Momentos únicos'),
  ('gallery_subtitle', 'Álbum de Fotos'),
  ('rsvp_text', 'Esperamos contar con tu presencia'),
  ('rsvp_deadline', ''),
  ('events', '[{"title":"Ceremonia","venue":"","address":"","date":"","time":"","maps_url":"","icon":"church"},{"title":"Civil","venue":"","address":"","date":"","time":"","maps_url":"","icon":"civil"},{"title":"Festejo","venue":"","address":"","date":"","time":"","maps_url":"","icon":"party"}]'),
  ('cost_salon', '0'),
  ('cost_dj', '0'),
  ('cost_cotillon', '0'),
  ('cost_catering', '0');

-- =============================================
-- Supabase Storage para fotos
-- =============================================
-- Crear bucket "photos" con acceso público desde el Dashboard:
--   Storage > New bucket > Name: "photos" > Public: true
--
-- O ejecutar:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
--
-- Agregar env var: SUPABASE_STORAGE_BUCKET=photos (o dejar vacío, usa "photos" por defecto)

-- 1. Invitados cargados por el admin
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  allows_companion BOOLEAN DEFAULT false,
  main_cost DECIMAL(10,2) DEFAULT 0,
  locked_companions JSONB DEFAULT '[]',
  max_adults INTEGER DEFAULT 0,
  adult_cost DECIMAL(10,2) DEFAULT 0,
  max_over12 INTEGER DEFAULT 0,
  over12_cost DECIMAL(10,2) DEFAULT 0,
  max_under12 INTEGER DEFAULT 0,
  under12_cost DECIMAL(10,2) DEFAULT 0,
  phrase_type TEXT DEFAULT 'friends',
  custom_phrase TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Confirmaciones hechas por los invitados
CREATE TABLE IF NOT EXISTS confirmations (
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

-- 3. Fotos subidas por los invitados
CREATE TABLE IF NOT EXISTS guest_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  photo_url TEXT NOT NULL,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT now()
);

-- 4. Configuración y precios editables desde el admin
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT now()
);

-- 5. Bucket público para guardar las fotos (hero, galería y fotos de invitados)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

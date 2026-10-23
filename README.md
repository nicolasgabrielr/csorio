# 💛 Wedding App

App web para casamiento con panel de administración.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (PostgreSQL)
- **Auth.js v5** (credentials)
- **Vercel** (deploy)

---

## Setup inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase-schema.sql`
3. Copiar las keys desde **Settings → API**

### 3. Configurar `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
AUTH_SECRET=tu-secret-aleatorio
AUTH_URL=http://localhost:3000

# Credenciales del admin
ADMIN_USER=admin
ADMIN_PASSWORD_HASH=  # ver instrucción abajo

# Datos del casamiento
NEXT_PUBLIC_WEDDING_DATE=2025-04-26
NEXT_PUBLIC_BRIDE_NAME=María
NEXT_PUBLIC_GROOM_NAME=Juan
NEXT_PUBLIC_VENUE_NAME=Salón La Armonía
NEXT_PUBLIC_VENUE_ADDRESS=Av. Libertador 1234, Buenos Aires
NEXT_PUBLIC_VENUE_MAPS_URL=https://maps.google.com/?q=...
NEXT_PUBLIC_VENUE_MAPS_EMBED=https://www.google.com/maps/embed?pb=...
NEXT_PUBLIC_CBU=0000003100012345678901
NEXT_PUBLIC_ALIAS=novios.casamiento
NEXT_PUBLIC_BANK_HOLDER=María García
```

### 4. Generar hash de contraseña admin

```bash
node scripts/generate-password-hash.mjs tu-contraseña-segura
```

Copiar el hash en `ADMIN_PASSWORD_HASH=` del `.env.local`.

### 5. Correr en desarrollo

```bash
npm run dev
```

---

## URLs

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con countdown |
| `/confirmar` | Confirmar asistencia |
| `/lugar` | Mapa y dirección |
| `/regalos` | CBU / alias |
| `/galeria` | Galería de fotos |
| `/admin/login` | Login admin |
| `/admin/invitados` | CRUD invitados |
| `/admin/confirmados` | Lista de confirmados |
| `/admin/metricas` | Estadísticas |

---

## Agregar fotos a la galería

1. Copiar fotos en `/public/photos/`
2. Editar `src/app/(public)/galeria/page.tsx` y agregar al array `PHOTOS`:

```ts
const PHOTOS = [
  { src: "/photos/foto1.jpg", alt: "Descripción" },
  { src: "/photos/foto2.jpg", alt: "Descripción" },
];
```

---

## Deploy en Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push a `main`

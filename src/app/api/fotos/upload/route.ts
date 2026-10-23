import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";

const USE_MOCK = !isSupabaseConfigured();
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "photos";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_MB = 10;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData inválido" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato no permitido. Usá JPG, PNG, WebP o AVIF." }, { status: 400 });
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo supera los ${MAX_MB} MB` }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `guest-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (USE_MOCK) {
    try {
      const dir = join(process.cwd(), "public", "photos", "guests");
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, filename), buffer);
      return NextResponse.json({ src: `/photos/guests/${filename}` });
    } catch {
      return NextResponse.json(
        { error: "Almacenamiento de fotos no activo aún. Hacé Redeploy en Vercel tras conectar Supabase." },
        { status: 500 }
      );
    }
  }

  try {
    const admin = createAdminClient();
    const storagePath = `guests/${filename}`;

    let { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (error && error.message?.toLowerCase().includes("bucket not found")) {
      await admin.storage.createBucket(STORAGE_BUCKET, { public: true });
      const retry = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({ src: urlData.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error inesperado al subir foto" },
      { status: 500 }
    );
  }
}

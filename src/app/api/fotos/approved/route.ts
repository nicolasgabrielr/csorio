import { NextResponse } from "next/server";
import { getGuestPhotos } from "@/actions/guest-photos";

export const dynamic = "force-dynamic";

export async function GET() {
  const photos = await getGuestPhotos("approved");
  return NextResponse.json(photos);
}

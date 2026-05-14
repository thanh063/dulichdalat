import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAuthenticatedSupabaseClient, getAuthTokenFromRequest, getUserIdFromToken } from "@/lib/reviews";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

const requestSchema = z.object({ place_slug: z.string().min(1) });

export async function GET(request: NextRequest) {
  const token = getAuthTokenFromRequest(request);
  const userId = token ? getUserIdFromToken(token) : null;
  const supabase = getSupabaseAdminClient();

  if (!userId || !supabase) {
    return NextResponse.json({ success: true, favorites: [] });
  }

  const { data, error } = await supabase
    .from("place_favorites")
    .select("place_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading favorites:", error);
    return NextResponse.json({ success: true, favorites: [] });
  }

  return NextResponse.json({ success: true, favorites: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const token = getAuthTokenFromRequest(request);
  const userId = getUserIdFromToken(token);
  const supabase = getSupabaseAdminClient();

  if (!userId || !supabase) {
    return NextResponse.json({ success: false, message: "Bạn cần đăng nhập để sử dụng yêu thích." }, { status: 401 });
  }

  const insert = await supabase
    .from("place_favorites")
    .insert({
      place_slug: parsed.data.place_slug,
      user_id: userId,
    })
    .select()
    .single();

  if (insert.error) {
    console.error("Error creating favorite:", insert.error);
    return NextResponse.json({ success: false, message: insert.error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, favorite: insert.data });
}

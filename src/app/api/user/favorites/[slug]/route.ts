import { NextResponse, type NextRequest } from "next/server";
import { getAuthTokenFromRequest, getUserIdFromToken } from "@/lib/reviews";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = getAuthTokenFromRequest(request);
  const userId = token ? getUserIdFromToken(token) : null;
  const supabase = getSupabaseAdminClient();

  if (!userId || !supabase) {
    return NextResponse.json({ success: false, message: "Bạn cần đăng nhập để xóa yêu thích." }, { status: 401 });
  }

  const del = await supabase.from("place_favorites").delete().eq("place_slug", slug).eq("user_id", userId);

  if (del.error) {
    return NextResponse.json({ success: false, message: del.error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

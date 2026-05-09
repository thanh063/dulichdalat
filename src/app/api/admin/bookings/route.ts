import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export async function GET(request: NextRequest) {
  const status = new URL(request.url).searchParams.get("status");
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ bookings: [] });
  }

  let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ bookings: data ?? [] });
}
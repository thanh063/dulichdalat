import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export async function GET() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ users: 0, bookings: 0, pending: 0 });
  }

  const [users, bookings, pending] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return NextResponse.json({
    users: users.count ?? 0,
    bookings: bookings.count ?? 0,
    pending: pending.count ?? 0,
  });
}
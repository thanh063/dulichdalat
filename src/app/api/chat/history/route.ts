import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

const historyQuerySchema = z.object({
  sid: z.string().min(1),
});

const createMessageSchema = z.object({
  sid: z.string().min(1),
  message: z.string().min(1),
  sender: z.enum(["user", "bot"]),
  userId: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = historyQuerySchema.safeParse({ sid: url.searchParams.get("sid") });

  if (!parsed.success) {
    return NextResponse.json({ success: false, history: [] }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: true, history: [] });
  }

  const { data, error } = await supabase
    .from("chat_history")
    .select("id, user_id, session_id, message, sender, created_at")
    .eq("session_id", parsed.data.sid)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, history: [] }, { status: 500 });
  }

  return NextResponse.json({ success: true, history: data ?? [] });
}

export async function POST(request: NextRequest) {
  const parsed = createMessageSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.from("chat_history").insert({
    session_id: parsed.data.sid,
    user_id: parsed.data.userId ?? null,
    message: parsed.data.message,
    sender: parsed.data.sender,
  });

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = historyQuerySchema.safeParse({ sid: url.searchParams.get("sid") });

  if (!parsed.success) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.from("chat_history").delete().eq("session_id", parsed.data.sid);

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
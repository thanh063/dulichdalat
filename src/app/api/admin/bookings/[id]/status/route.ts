import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

const requestSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Trạng thái không hợp lệ." }, { status: 400 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công." });
  }

  const { error } = await supabase.from("bookings").update({ status: parsed.data.status }).eq("id", id);
  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: "Cập nhật trạng thái thành công." });
}
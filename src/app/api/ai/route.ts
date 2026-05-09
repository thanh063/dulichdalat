import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { handleMessage } from "@/lib/chatbot/handler";

const requestSchema = z.object({
  q: z.string().optional().default(""),
  sid: z.string().min(1),
  payload: z
    .object({
      action: z.enum(["go_node", "open_link", "open_booking", "export_itinerary"]),
      value: z.string(),
    })
    .optional(),
  loc: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Thiếu session hoặc dữ liệu đầu vào không hợp lệ." }, { status: 400 });
  }

  const result = await handleMessage({
    q: parsed.data.q,
    sid: parsed.data.sid,
    payload: parsed.data.payload,
    loc: parsed.data.loc ?? null,
  });

  return NextResponse.json(result);
}
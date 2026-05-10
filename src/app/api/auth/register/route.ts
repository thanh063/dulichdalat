import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Dữ liệu đăng ký không hợp lệ." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: true, message: "Đăng ký mô phỏng thành công (chưa cấu hình Supabase)." });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
    },
  });

  if (error) {
    // Keep auth errors as 200 responses so the client can display the message
    // without surfacing a network-level 4xx in the browser console.
    return NextResponse.json({ success: false, message: error.message });
  }

  return NextResponse.json({ success: true, message: "Đăng ký thành công. Vui lòng kiểm tra email xác nhận." });
}
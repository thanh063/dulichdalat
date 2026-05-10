import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Dữ liệu đăng nhập không hợp lệ." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: true, message: "Đăng nhập mô phỏng thành công (chưa cấu hình Supabase)." });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Return application-level error (200) so frontend can display message
    // without producing a network-level 4xx in the browser console.
    return NextResponse.json({ success: false, message: error.message });
  }

  return NextResponse.json({
    success: true,
    message: "Đăng nhập thành công.",
    user: data.user,
    session: data.session,
  });
}
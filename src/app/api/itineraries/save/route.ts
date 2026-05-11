import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      title?: string;
      startDate?: string;
      durationDays?: number;
      days?: Array<{ date: string; places: string[] }>;
    };

    const { title, startDate, durationDays, days } = body;

    // Get auth cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get("sb-auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ success: false, message: "Yêu cầu đăng nhập" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: "Cấu hình Supabase không đầy đủ" },
        { status: 500 },
      );
    }

    // Create admin client to verify user
    const adminClient = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const {
      data: { user },
    } = await adminClient.auth.getUser(authToken);

    if (!user) {
      return NextResponse.json({ success: false, message: "Người dùng không hợp lệ" }, { status: 401 });
    }

    // Generate share token
    const shareToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Save itinerary
    const { data, error } = await adminClient
      .from("itineraries")
      .insert({
        user_id: user.id,
        title: title || `Tour ${durationDays} ngày`,
        start_date: startDate,
        duration_days: durationDays,
        itinerary_data: { days },
        share_token: shareToken,
        is_public: true,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      shareToken,
    });
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Lỗi lưu lịch trình" },
      { status: 500 },
    );
  }
}

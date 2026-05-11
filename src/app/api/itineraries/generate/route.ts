import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      startDate?: string;
      durationDays?: number;
    };

    const { startDate = new Date().toISOString().split("T")[0], durationDays = 3 } = body;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { success: false, message: "GEMINI_API_KEY không được cấu hình" },
        { status: 500 },
      );
    }

    const client = new GoogleGenerativeAI(geminiKey);
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Tạo một lịch trình du lịch Đà Lạt cho ${durationDays} ngày bắt đầu từ ${startDate}. 
Trả lời bằng JSON có cấu trúc sau:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "places": ["Địa điểm 1", "Địa điểm 2", "Địa điểm 3"]
    }
  ]
}

Yêu cầu:
- Mỗi ngày có 3-4 địa điểm
- Các địa điểm phải nổi tiếng ở Đà Lạt
- Sắp xếp theo thứ tự tham quan hợp lý (giảm chi phí di chuyển)
- Bao gồm các danh lam thắng cảnh, quán ăn, cafe nổi tiếng

Chỉ trả lại JSON, không có giải thích.`;

    const response = await model.generateContent(prompt);
    const text = response.content.blocks[0]?.text || "";

    // Parse JSON từ response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Không thể parse lịch trình từ AI");
    }

    const itinerary = JSON.parse(jsonMatch[0]) as { days?: Array<{ date: string; places: string[] }> };

    return NextResponse.json({ success: true, ...itinerary });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Lỗi tạo lịch trình" },
      { status: 500 },
    );
  }
}

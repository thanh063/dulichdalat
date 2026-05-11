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
    
    // Fallback data if no API key configured
    if (!geminiKey) {
      const suggestedPlaces = [
        "Thác Datanla",
        "Đồi Thông Hồ",
        "Nhà thờ Con Gà",
        "Hồ Xuân Hương",
        "Vườn hoa Thành phố",
        "Ga Đà Lạt",
        "Phố cổ Lâm Đồng",
        "Thiền viện Trúc Lâm",
        "Thác Liên Khương",
        "Langbiang Palace",
        "Vườn Đơi",
        "Chợ Đà Lạt",
      ];

      const days = Array.from({ length: durationDays }, (_, i) => ({
        date: new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        places: suggestedPlaces.slice(i * 3, i * 3 + 3),
      }));

      return NextResponse.json({ success: true, days });
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

import type { FlowNode } from "@/lib/chatbot/types";

type FlowData = {
  start: string;
  nodes: Record<string, FlowNode>;
};

export const FLOW: FlowData = {
  start: "intro",
  nodes: {
    intro: {
      text: "Xin chào 👋 Mình là trợ lý du lịch Đà Lạt. Bạn muốn mình hỗ trợ gì hôm nay?",
      choices: [
        { label: "🌸 Địa điểm tham quan", next: "intro" },
        { label: "☕ Cafe & Ẩm thực", next: "intro" },
        { label: "🏨 Lưu trú", next: "booking" },
        { label: "🗓️ Lên lịch trình", next: "intro" },
        { label: "🛵 Di chuyển", next: "intro" },
      ],
    },
    booking: {
      text: "Bạn muốn đặt bàn hay đặt phòng?",
      choices: [
        { label: "🍽️ Đặt bàn nhà hàng", payload: { action: "open_booking", value: "", type: "table" } },
        { label: "🏨 Đặt phòng/homestay", payload: { action: "open_booking", value: "", type: "room" } },
        { label: "⬅ Menu chính", next: "intro" },
      ],
    },
  },
};

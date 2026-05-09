import type { ChatChoice } from "@/lib/chatbot/types";

export const introChoices: ChatChoice[] = [
  { label: "Lịch trình 3 ngày 2 đêm", payload: { action: "go_node", value: "itinerary_3d2n" } },
  { label: "Quán cà phê view đẹp", payload: { action: "go_node", value: "cafe_views" } },
  { label: "Homestay giá tốt", payload: { action: "go_node", value: "stay_booking" } },
];
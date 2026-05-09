import type { ChatChoice } from "./types";
import { extractNumber, normalizeText } from "./text";

type RuleResult = {
  message: string;
  choices: ChatChoice[];
};

const defaultChoices: ChatChoice[] = [
  { label: "Lịch trình 3 ngày 2 đêm", payload: { action: "go_node", value: "itinerary_3d2n" } },
  { label: "Quán cà phê view đẹp", payload: { action: "go_node", value: "cafe_views" } },
  { label: "Đặt phòng homestay", payload: { action: "go_node", value: "stay_booking" } },
];

function itineraryMessage(query: string) {
  const days = extractNumber(query) ?? 3;

  return {
    message:
      days <= 2
        ? "Mình gợi ý lịch trình nhẹ nhàng 2 ngày với hồ Xuân Hương, ga Đà Lạt, một quán cà phê view đồi và chợ đêm cho buổi tối."
        : `Với ${days} ngày ở Đà Lạt, bạn có thể chia thành ngày check-in trung tâm, ngày đi hồ - đồi chè, và một ngày trekking hoặc săn mây.`,
    choices: defaultChoices,
  } satisfies RuleResult;
}

export function resolveRuleResponse(query: string): RuleResult | null {
  const normalized = normalizeText(query);

  if (!normalized) {
    return {
      message:
        "Xin chào! Tôi có thể giúp bạn lên lịch trình, gợi ý địa điểm, đặt phòng hoặc đặt bàn ở Đà Lạt.",
      choices: defaultChoices,
    };
  }

  if (normalized.includes("lich trinh") || normalized.includes("itinerary")) {
    return itineraryMessage(normalized);
  }

  if (normalized.includes("cafe") || normalized.includes("ca phe")) {
    return {
      message:
        "Đà Lạt có rất nhiều quán cà phê view đẹp như Mê Linh, The Married Beans hay Là Việt. Tôi có thể lọc theo trung tâm, săn mây hoặc phong cách vintage.",
      choices: defaultChoices,
    };
  }

  if (normalized.includes("an sang") || normalized.includes("lau bo") || normalized.includes("am thuc")) {
    return {
      message:
        "Ẩm thực Đà Lạt rất hợp để đi theo cụm: bánh tráng nướng, bánh mì xíu mại, lẩu bò, sữa đậu nành nóng và đồ nướng chợ đêm.",
      choices: defaultChoices,
    };
  }

  if (normalized.includes("homestay") || normalized.includes("phong") || normalized.includes("luu tru")) {
    return {
      message:
        "Tôi có thể gợi ý homestay giá mềm, villa cho nhóm bạn hoặc resort cho kỳ nghỉ riêng tư. Hãy cho tôi biết ngân sách và số khách.",
      choices: defaultChoices,
    };
  }

  if (normalized.includes("mua sam") || normalized.includes("dac san")) {
    return {
      message:
        "Bạn có thể mua dâu tây, mứt hồng, atiso, trà ô long và các sản phẩm nông nghiệp địa phương ở chợ hoặc các cửa hàng đặc sản uy tín.",
      choices: defaultChoices,
    };
  }

  return null;
}

export function getFallbackChoices() {
  return defaultChoices;
}
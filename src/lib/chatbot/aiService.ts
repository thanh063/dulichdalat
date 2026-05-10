import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { findPlace } from "./rules";
import { normalizeText } from "./text";
import type { Intent, ItinerarySlots, NLUResult, Place, Slots } from "./types";

const geminiApiKey = process.env.GEMINI_API_KEY;

const model = geminiApiKey
  ? new GoogleGenerativeAI(geminiApiKey).getGenerativeModel({
      model: "gemini-2.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    })
  : null;

const nluPromptTemplate = `
Bạn là một NLU (Bộ phân tích ngôn ngữ).
Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và CHỈ trả về một đối tượng JSON.
Không giải thích, không thêm bất cứ chữ gì ngoài JSON.

Các 'intent' (ý định) hợp lệ là: [nuong, cafe, sight, itinerary, stay, transport, food, booking, general_knowledge, context_followup, specific_place, recall_itinerary, unknown].
Các 'slots' (thực thể) hợp lệ là: [area, near_place, groupSize, budget, dish, theme, days, nights, traveler_type, pace, stay_type, price_range, vehicle_type].

QUAN TRỌNG:
- "vừa phải" có thể là budget HOẶC pace tùy ngữ cảnh.
- Nếu câu hỏi TRƯỚC ĐÓ của bot hỏi về "kinh phí" hoặc "budget" → "vừa phải" là budget
- Nếu câu hỏi TRƯỚC ĐÓ của bot hỏi về "nhịp độ" hoặc "pace" → "vừa phải" là pace
- "thong thả", "thong thả thôi", "chậm rãi" → pace
- "đi nhiều nơi", "nhanh", "khám phá nhiều" → pace
- "tiết kiệm", "rộng rãi", "sang trọng" → budget
- Nếu không rõ ràng, ưu tiên theo ngữ cảnh câu hỏi.

{CONTEXT_HINT}

Nếu người dùng hỏi về "lịch trình của tôi", "lịch trình trước", "lịch trình vừa tạo", "lịch trình đã lên", "lịch trình đã cho", hoặc các câu tương tự → trả về intent "recall_itinerary".

Câu hỏi của người dùng: "lịch trình 4 ngày 3 đêm"
JSON:
{ "intent": "itinerary", "slots": { "days": 4, "nights": 3 } }

Câu hỏi của người dùng: "6"
JSON:
{ "intent": "itinerary", "slots": { "days": 6 } }

Câu hỏi của người dùng: "3 ngày"
JSON:
{ "intent": "itinerary", "slots": { "days": 3 } }

Câu hỏi của người dùng: "cặp đôi"
JSON:
{ "intent": "itinerary", "slots": { "groupSize": 2, "traveler_type": "cặp đôi" } }

Câu hỏi của người dùng: "5 người"
JSON:
{ "intent": "itinerary", "slots": { "groupSize": 5 } }

Câu hỏi của người dùng: "gia đình"
JSON:
{ "intent": "itinerary", "slots": { "traveler_type": "gia đình" } }

Câu hỏi của người dùng: "kinh phí vừa phải"
JSON:
{ "intent": "itinerary", "slots": { "budget": "vừa phải" } }

Câu hỏi của người dùng: "tiết kiệm"
JSON:
{ "intent": "itinerary", "slots": { "budget": "tiết kiệm" } }

Câu hỏi của người dùng: "rộng rãi"
JSON:
{ "intent": "itinerary", "slots": { "budget": "rộng rãi" } }

Câu hỏi của người dùng: "cafe sống ảo"
JSON:
{ "intent": "itinerary", "slots": { "theme": "cafe sống ảo" } }

Câu hỏi của người dùng: "ẩm thực"
JSON:
{ "intent": "itinerary", "slots": { "theme": "ẩm thực" } }

Câu hỏi của người dùng: "thiên nhiên"
JSON:
{ "intent": "itinerary", "slots": { "theme": "thiên nhiên" } }

Câu hỏi của người dùng: "tham quan"
JSON:
{ "intent": "itinerary", "slots": { "theme": "tham quan" } }

Câu hỏi của người dùng: "tham quan di tích"
JSON:
{ "intent": "itinerary", "slots": { "theme": "tham quan di tích" } }

Câu hỏi của người dùng: "tụi mình muốn đi thong thả thôi"
JSON:
{ "intent": "itinerary", "slots": { "pace": "thong thả" } }

Câu hỏi của người dùng: "thong thả"
JSON:
{ "intent": "itinerary", "slots": { "pace": "thong thả" } }

Câu hỏi của người dùng: "nhịp độ vừa phải"
JSON:
{ "intent": "itinerary", "slots": { "pace": "vừa phải" } }

Câu hỏi của người dùng: "vừa phải thôi"
JSON:
{ "intent": "itinerary", "slots": { "pace": "vừa phải" } }

Câu hỏi của người dùng: "đi nhiều nơi"
JSON:
{ "intent": "itinerary", "slots": { "pace": "đi nhiều nơi" } }

Câu hỏi của người dùng: "chậm rãi"
JSON:
{ "intent": "itinerary", "slots": { "pace": "chậm rãi" } }

Câu hỏi của người dùng: "quán nướng ngon"
JSON:
{ "intent": "nuong", "slots": {} }

Câu hỏi của người dùng: "chỗ vui chơi cho trẻ em"
JSON:
{ "intent": "sight", "slots": { "theme": "trẻ em" } }

Câu hỏi của người dùng: "Dinh 3 Bảo Đại"
JSON:
{ "intent": "specific_place", "slots": { "name": "Dinh III Bảo Đại" } }

Câu hỏi của người dùng: "đặt bàn"
JSON:
{ "intent": "booking", "slots": {} }

Câu hỏi của người dùng: "muốn đặt bàn nhà hàng"
JSON:
{ "intent": "booking", "slots": {} }

Câu hỏi của người dùng: "tôi muốn book bàn"
JSON:
{ "intent": "booking", "slots": {} }

--- KẾT THÚC VÍ DỤ ---
Câu hỏi của người dùng: "{QUERY}"
JSON:
`;

const itinerarySlotFillPrompt = `
Bạn là "Trợ lý Đà Lạt" xuất sắc, đang giúp người dùng lên kế hoạch.
Nhiệm vụ của bạn là hỏi MỘT CÂU HỎI TIẾP THEO để thu thập thông tin còn thiếu.

Các thông tin bạn CẦN HỎI (theo thứ tự ưu tiên):
1. days (số ngày)
2. groupSize (số lượng người)
3. traveler_type (bạn đi cùng ai: gia đình, cặp đôi, bạn bè...)
4. budget (kinh phí: tiết kiệm, vừa phải, rộng rãi)
5. theme (chủ đề: thiên nhiên, ẩm thực, cafe sống ảo, tham quan)
6. pace (nhịp độ: thong thả, vừa phải, đi nhiều nơi)

Các thông tin bạn ĐÃ BIẾT (dạng JSON):
{KNOWN_SLOTS}

Slot TIẾP THEO bạn cần hỏi là: "{NEXT_SLOT}"

--- QUAN TRỌNG ---
Nhiệm vụ của bạn CHỈ LÀ HỎI 1 CÂU HỎI DUY NHẤT.
KHÔNG được tạo lịch trình.
KHÔNG được đưa ra gợi ý chung chung.
KHÔNG được hỏi xác nhận thông tin cũ (ví dụ: "Vậy là... phải không?").
Example: "Tuyệt! Về kinh phí, bạn muốn chuyến đi này ở mức nào (tiết kiệm, vừa phải, hay rộng rãi) ạ?"

Câu hỏi tiếp theo của bạn (CHỈ MỘT CÂU):
`;

const itineraryAnswerPromptTemplate = `
Bạn là "Trợ lý Đà Lạt" xuất sắc.
Câu hỏi của người dùng là: "{QUERY}"

Nhiệm vụ: Hãy tạo một lịch trình chi tiết theo ngày (Ngày 1, Sáng/Trưa/Chiều/Tối, Ngày 2, ...)
Dựa *TUYỆT ĐỐI* vào danh sách địa điểm (JSON) tôi cung cấp.
Bạn phải SẮP XẾP các địa điểm này một cách hợp lý vào các ngày.
Bạn có thể thêm các quán ăn từ danh sách vào bữa trưa/tối.

--- QUAN TRỌNG ---
- Trả lời bằng văn bản thuần (plain text), KHÔNG DÙNG MARKDOWN (**).
- Phải có cấu trúc "Ngày 1:", "Ngày 2:".
- Nếu dữ liệu có "gmapsLink", hãy dán link đó vào.

Dữ liệu (Danh sách địa điểm bạn được phép dùng):
"{DATA}"

Lịch trình của bạn (viết bằng tiếng Việt, thân thiện):
`;

const answerPromptTemplate = `
Bạn là "Trợ lý Đà Lạt", một trợ lý du lịch ảo rất thân thiện và am hiểu.
Câu hỏi của người dùng là: "{QUERY}"

--- DỮ LIỆU (DATA) ---
Tôi đã tìm thấy {DATA_COUNT} địa điểm phù hợp trong cơ sở dữ liệu của mình:
"{DATA}"
--- KẾT THÚC DỮ LIỆU ---

Nhiệm vụ:
1. Dựa *TUYỆT ĐỐI* vào DỮ LIỆU tôi cung cấp bên trên để trả lời.
2. Nếu {DATA_COUNT} là 0 (không có dữ liệu), HÃY BÁO LÀ BẠN KHÔNG TÌM THẤY.
3. Nếu {DATA_COUNT} lớn hơn 0, HÃY GIỚI THIỆU 1-3 địa điểm TỪ DỮ LIỆU ĐÓ.
4. Không được phép bịa ra tên địa điểm.
5. Trả lời bằng văn bản thuần (plain text), KHÔNG DÙNG MARKDOWN (**).
6. Nếu dữ liệu có "gmapsLink", hãy dán link đó vào.

--- [YÊU CẦU MỚI: DATA THỜI GIAN THỰC] ---
7. Nếu dữ liệu có trường "rating" và "user_ratings_total", hãy hiển thị bên cạnh tên quán (ví dụ: Quán A (4.5 sao / 200 đánh giá)).
8. Nếu dữ liệu có trường "isOpen":
   - Nếu "isOpen" là true, hãy nói: "Quán đang mở cửa".
   - Nếu "isOpen" là false, hãy nói: "Quán đang đóng cửa".
------------------------------------------

Câu trả lời của bạn (viết bằng tiếng Việt, thân thiện):
`;

const generalAnswerPromptTemplate = `
Bạn là "Trợ lý Đà Lạt". Hãy trả lời câu hỏi sau của người dùng một cách thân thiện, ngắn gọn, và
sử dụng văn bản thuần (plain text).
Không được sử dụng bất kỳ định dạng Markdown nào (như **dấu sao** hoặc # gạch đầu dòng).

Câu hỏi: "{QUERY}"
`;

function isFallbackModel() {
  return !model;
}

async function generateFromModel(prompt: string) {
  if (!model) {
    throw new Error("Gemini API key is missing");
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

function buildSlotsFromQuery(query: string, lastBotQuestion?: string): Slots {
  const normalized = normalizeText(query);
  const slots: Slots = {};

  const dayMatch = normalized.match(/(\d+)\s*ngay/);
  const nightMatch = normalized.match(/(\d+)\s*dem/);
  const groupMatch = normalized.match(/(\d+)\s*(nguoi|khach)/);

  if (dayMatch?.[1]) slots.days = Number(dayMatch[1]);
  if (nightMatch?.[1]) slots.nights = Number(nightMatch[1]);
  if (groupMatch?.[1]) slots.groupSize = Number(groupMatch[1]);

  if (normalized.includes("gia dinh")) {
    slots.traveler_type = "gia đình";
  } else if (normalized.includes("cap doi")) {
    slots.traveler_type = "cặp đôi";
    slots.groupSize = slots.groupSize ?? 2;
  } else if (normalized.includes("ban be")) {
    slots.traveler_type = "bạn bè";
  }

  if (normalized.includes("tiet kiem") || normalized.includes("re") || normalized.includes("sieu tiet kiem")) {
    slots.budget = "tiết kiệm";
  } else if (normalized.includes("rong rai") || normalized.includes("sang trong")) {
    slots.budget = "rộng rãi";
  } else if (normalized.includes("vua phai")) {
    if (lastBotQuestion && (normalizeText(lastBotQuestion).includes("kinh phi") || normalizeText(lastBotQuestion).includes("budget"))) {
      slots.budget = "vừa phải";
    } else {
      slots.pace = "vừa phải";
    }
  }

  if (normalized.includes("thong tha") || normalized.includes("cham rai")) {
    slots.pace = "thong thả";
  } else if (normalized.includes("di nhieu noi") || normalized.includes("nhanh") || normalized.includes("kham pha nhieu")) {
    slots.pace = "đi nhiều nơi";
  }

  if (normalized.includes("cafe") || normalized.includes("song ao")) {
    slots.theme = "cafe sống ảo";
  } else if (normalized.includes("am thuc") || normalized.includes("an uong") || normalized.includes("lau") || normalized.includes("nuong")) {
    slots.theme = "ẩm thực";
  } else if (normalized.includes("thien nhien") || normalized.includes("canh quan")) {
    slots.theme = "thiên nhiên";
  } else if (normalized.includes("tham quan") || normalized.includes("check in") || normalized.includes("lich su")) {
    slots.theme = "tham quan";
  }

  if (normalized.includes("gan")) slots.near_place = query;
  if (normalized.includes("xe may") || normalized.includes("o to") || normalized.includes("taxi")) slots.vehicle_type = query;
  if (normalized.includes("pho") || normalized.includes("bun") || normalized.includes("com")) slots.dish = query;

  return slots;
}

function detectIntent(query: string): Intent {
  const normalized = normalizeText(query);

  if (normalized.includes("lich trinh cua toi") || normalized.includes("lich trinh truoc") || normalized.includes("da tao")) return "recall_itinerary";
  if (normalized.includes("dat ban") || normalized.includes("book") || normalized.includes("dat phong") || normalized.includes("dat cho")) return "booking";
  if (normalized.includes("thue xe") || normalized.includes("di chuyen") || normalized.includes("xe may") || normalized.includes("taxi")) return "transport";
  if (normalized.includes("homestay") || normalized.includes("khach san") || normalized.includes("resort") || normalized.includes("luu tru")) return "stay";
  if (normalized.includes("ca phe") || normalized.includes("cafe") || normalized.includes("coffee")) return "cafe";
  if (normalized.includes("nuong") || normalized.includes("bbq") || normalized.includes("lau")) return "nuong";
  if (normalized.includes("am thuc") || normalized.includes("an vat") || normalized.includes("an uong")) return "food";
  if (normalized.includes("lich trinh") || normalized.includes("ngay") || normalized.includes("dem") || normalized.includes("ke hoach")) return "itinerary";
  if (findPlace(query)) return "specific_place";
  if (normalized.includes("tham quan") || normalized.includes("di dau") || normalized.includes("check in") || normalized.includes("canh dep") || normalized.includes("thien nhien") || normalized.includes("diem den")) return "sight";
  if (normalized.includes("gio mo cua") || normalized.includes("thoi tiet") || normalized.includes("bao nhieu") || normalized.includes("o dau")) return "general_knowledge";
  return "unknown";
}

function formatPlace(place: Place) {
  const lines: string[] = [`- ${place.name}`];

  if (typeof place.rating === "number") {
    const reviewPart = place.user_ratings_total ? ` / ${place.user_ratings_total} đánh giá` : "";
    lines.push(`  ${place.rating.toFixed(1)} sao${reviewPart}`);
  }

  lines.push(`  Địa chỉ: ${place.address}`);
  lines.push(`  Giờ mở cửa: ${place.hours}`);
  lines.push(`  Mô tả: ${place.summary}`);

  if (place.isOpen !== undefined) {
    lines.push(`  ${place.isOpen ? "Quán đang mở cửa" : "Quán đang đóng cửa"}`);
  }

  if (place.gmapsLink) {
    lines.push(`  Bản đồ: ${place.gmapsLink}`);
  }

  return lines.join("\n");
}

function fallbackGenerateAnswer(query: string, places: Place[], intent: Intent): string {
  if (places.length === 0) {
    return `Mình chưa tìm thấy địa điểm phù hợp cho câu hỏi: ${query}. Bạn có thể mô tả rõ hơn về khu vực, loại địa điểm hoặc ngân sách nhé.`;
  }

  if (intent === "specific_place") {
    return [`Mình tìm thấy ${places[0].name} cho bạn:`, formatPlace(places[0])].join("\n");
  }

  const lines = ["Mình gợi ý cho bạn các địa điểm phù hợp:"];
  for (const place of places.slice(0, 3)) {
    lines.push(formatPlace(place));
  }

  return lines.join("\n\n");
}

function fallbackGetGeneralAnswer(query: string) {
  const matchedPlace = findPlace(query);
  if (matchedPlace) {
    return fallbackGenerateAnswer(query, [matchedPlace], "specific_place");
  }

  return [
    "Mình có thể giúp bạn tìm địa điểm, lên lịch trình hoặc gợi ý ăn uống ở Đà Lạt.",
    "Bạn có thể nói rõ hơn theo một trong các cách: '3 ngày 2 đêm', 'quán cafe view đẹp', 'địa điểm tham quan gần trung tâm', hoặc 'đặt bàn nhà hàng'.",
  ].join("\n");
}

function fallbackAskForNextSlot(slots: ItinerarySlots, nextSlot: keyof ItinerarySlots) {
  const labelMap: Record<keyof ItinerarySlots, string> = {
    days: "bạn đi mấy ngày",
    nights: "bạn ở mấy đêm",
    groupSize: "đi bao nhiêu người",
    budget: "mức kinh phí bạn mong muốn",
    theme: "chủ đề chuyến đi",
    traveler_type: "bạn đi cùng ai",
    pace: "nhịp độ chuyến đi",
  };

  const currentSummary = Object.entries(slots)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  const question = labelMap[nextSlot] ?? "thông tin còn thiếu";
  return currentSummary
    ? `Mình đã có: ${currentSummary}. Về ${question}, bạn muốn thế nào?`
    : `Để mình lên lịch trình, bạn cho mình biết ${question} nhé?`;
}

async function generateModelOrFallback(prompt: string, fallback: string) {
  if (!model) return fallback;

  try {
    return await generateFromModel(prompt);
  } catch (error) {
    console.error("Gemini fallback triggered:", error);
    return fallback;
  }
}

export async function parseIntent(query: string, lastBotQuestion?: string): Promise<NLUResult> {
  if (isFallbackModel()) {
    return {
      intent: detectIntent(query),
      slots: buildSlotsFromQuery(query, lastBotQuestion),
    };
  }

  const normQuery = normalizeText(query);
  let contextHint = "";
  if (lastBotQuestion) {
    const normalizedLast = normalizeText(lastBotQuestion);
    if (normalizedLast.includes("kinh phi") || normalizedLast.includes("budget") || normalizedLast.includes("tiet kiem") || normalizedLast.includes("rong rai")) {
      contextHint = 'GỢI Ý NGỮ CẢNH: Bot vừa hỏi về KINH PHÍ, nên "vừa phải" nên được parse thành budget.';
    } else if (normalizedLast.includes("nhịp độ") || normalizedLast.includes("pace") || normalizedLast.includes("thong thả") || normalizedLast.includes("khám phá")) {
      contextHint = 'GỢI Ý NGỮ CẢNH: Bot vừa hỏi về NHỊP ĐỘ, nên "vừa phải" nên được parse thành pace.';
    }
  }

  const prompt = nluPromptTemplate
    .replace("{QUERY}", normQuery)
    .replace("{CONTEXT_HINT}", contextHint);

  try {
    const text = await generateFromModel(prompt);
    const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonText) as NLUResult;
  } catch (error) {
    console.error("Lỗi AI NLU (parseIntent):", error);
    return { intent: detectIntent(query), slots: buildSlotsFromQuery(query, lastBotQuestion) };
  }
}

export async function generateAnswer(query: string, places: Place[], intent: Intent): Promise<string> {
  if (isFallbackModel()) {
    return fallbackGenerateAnswer(query, places, intent);
  }

  const dataString = JSON.stringify(places);
  const dataCount = places.length;
  const prompt = (intent === "itinerary" ? itineraryAnswerPromptTemplate : answerPromptTemplate)
    .replace("{QUERY}", query)
    .replace(/{DATA_COUNT}/g, dataCount.toString())
    .replace("{DATA}", dataString);

  return generateModelOrFallback(prompt, fallbackGenerateAnswer(query, places, intent));
}

export async function getGeneralAnswer(query: string): Promise<string> {
  if (isFallbackModel()) {
    return fallbackGetGeneralAnswer(query);
  }

  const prompt = generalAnswerPromptTemplate.replace("{QUERY}", query);
  return generateModelOrFallback(prompt, fallbackGetGeneralAnswer(query));
}

export async function continueItinerary(query: string, knownSlots: ItinerarySlots): Promise<string> {
  const requiredSlots: (keyof ItinerarySlots)[] = ["days", "groupSize", "traveler_type", "budget", "theme", "pace"];
  const missingSlots = requiredSlots.filter((slot) => !knownSlots[slot]);
  if (missingSlots.length > 0) {
    return askForNextSlot(knownSlots, missingSlots[0]);
  }

  return "Tôi đã có đủ thông tin!";
}

export async function askForNextSlot(knownSlots: ItinerarySlots, nextSlot: keyof ItinerarySlots): Promise<string> {
  if (isFallbackModel()) {
    return fallbackAskForNextSlot(knownSlots, nextSlot);
  }

  const prompt = itinerarySlotFillPrompt
    .replace("{KNOWN_SLOTS}", JSON.stringify(knownSlots))
    .replace(/{NEXT_SLOT}/g, nextSlot);

  return generateModelOrFallback(prompt, fallbackAskForNextSlot(knownSlots, nextSlot));
}

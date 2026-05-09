import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveRuleResponse } from "./rules";
import type { ChatResult } from "./types";

function buildSystemPrompt() {
  return [
    "Bạn là trợ lý du lịch Đà Lạt.",
    "Hãy trả lời bằng tiếng Việt, ngắn gọn, hữu ích và có cấu trúc rõ ràng.",
    "Ưu tiên lịch trình, địa điểm, ẩm thực, lưu trú và đặt chỗ ở Đà Lạt.",
  ].join(" ");
}

export async function generateAiResponse(query: string): Promise<ChatResult | null> {
  const localResult = resolveRuleResponse(query);
  if (localResult) {
    return localResult;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`${buildSystemPrompt()}\n\nCâu hỏi: ${query}`);
  const message = result.response.text().trim();

  return {
    message: message || "Tôi đã ghi nhận câu hỏi của bạn về Đà Lạt.",
    choices: [],
  };
}
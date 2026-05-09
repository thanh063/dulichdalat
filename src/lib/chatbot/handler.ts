import { generateAiResponse } from "./aiService";
import { getFallbackChoices } from "./rules";
import { getSupabaseAdminClient } from "./db";
import type { ChatContext, ChatResult, SessionState } from "./types";

const sessions = new Map<string, SessionState>();

function getSession(sessionId: string) {
  const existing = sessions.get(sessionId);

  if (existing) {
    return existing;
  }

  const created: SessionState = {
    history: [],
    lastBotMessage: "",
  };

  sessions.set(sessionId, created);
  return created;
}

async function persistChat(sessionId: string, userMessage: string, botMessage: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
  const userId = profiles?.[0]?.id ?? null;

  await supabase.from("chat_history").insert([
    {
      user_id: userId,
      session_id: sessionId,
      message: userMessage,
      sender: "user",
    },
    {
      user_id: userId,
      session_id: sessionId,
      message: botMessage,
      sender: "bot",
    },
  ]);
}

export async function handleMessage(context: ChatContext): Promise<ChatResult> {
  const session = getSession(context.sid);
  const message = context.q.trim();

  if (context.payload?.action === "go_node" && context.payload.value === "intro") {
    const intro =
      "Xin chào! Tôi có thể lên lịch trình theo ngày, nhóm đi, ngân sách và sở thích của bạn. Hãy thử nói: 'Lịch trình 3 ngày 2 đêm cho cặp đôi'.";

    session.lastBotMessage = intro;
    return {
      message: intro,
      choices: getFallbackChoices(),
    };
  }

  const aiResponse = await generateAiResponse(message);
  const finalMessage = aiResponse?.message ?? "Tôi có thể gợi ý lịch trình, địa điểm và chỗ ở nếu bạn mô tả nhu cầu cụ thể hơn.";
  const finalChoices = aiResponse?.choices.length ? aiResponse.choices : getFallbackChoices();

  session.history.push({ role: "user", text: message });
  session.history.push({ role: "bot", text: finalMessage });
  session.lastBotMessage = finalMessage;

  void persistChat(context.sid, message, finalMessage);

  return {
    message: finalMessage,
    choices: finalChoices,
  };
}
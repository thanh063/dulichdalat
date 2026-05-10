import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export interface ChatMessage {
  id?: number;
  user_id: number;
  message: string;
  sender: 'user' | 'bot';
  created_at?: string;
}

export async function saveChatMessage(userId: number, message: string, sender: 'user' | 'bot'): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const res = await supabase.from('chat_history').insert({ user_id: userId, message, sender });
  return !res.error;
}

export async function getChatHistory(userId: number, limit = 50): Promise<ChatMessage[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const res = await supabase
    .from('chat_history')
    .select('id, user_id, message, sender, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (res.error || !res.data) return [];
  // reverse so oldest first
  return (res.data as ChatMessage[]).reverse();
}

export async function clearChatHistory(userId: number): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const res = await supabase.from('chat_history').delete().eq('user_id', userId);
  return !res.error;
}

export async function countUserMessages(userId: number): Promise<number> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return 0;

  const res = await supabase.from('chat_history').select('id', { count: 'exact', head: false }).eq('user_id', userId);
  if (res.error) return 0;
  return Array.isArray(res.data) ? res.data.length : 0;
}

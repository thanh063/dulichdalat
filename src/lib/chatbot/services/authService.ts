import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role?: string;
};

function getPublicAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function registerUser(input: RegisterInput): Promise<{
  success: boolean;
  message: string;
  user?: AuthProfile;
}> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { success: false, message: "Chưa cấu hình Supabase admin client." };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      name: input.name,
      phone: input.phone,
      address: input.address || "",
    },
  });

  if (error || !data.user) {
    return { success: false, message: error?.message || "Không thể tạo tài khoản." };
  }

  return {
    success: true,
    message: "Đăng ký thành công.",
    user: {
      id: data.user.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      role: "user",
    },
  };
}

export async function loginUser(input: LoginInput): Promise<{
  success: boolean;
  message: string;
  user?: AuthProfile;
}> {
  const supabase = getPublicAuthClient();
  if (!supabase) {
    return { success: false, message: "Chưa cấu hình Supabase anon client." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    return { success: false, message: error?.message || "Đăng nhập thất bại." };
  }

  return {
    success: true,
    message: "Đăng nhập thành công.",
    user: {
      id: data.user.id,
      name: data.user.user_metadata?.name || "Khách",
      email: data.user.email || input.email,
      phone: data.user.user_metadata?.phone || "",
      address: data.user.user_metadata?.address || "",
      role: "user",
    },
  };
}

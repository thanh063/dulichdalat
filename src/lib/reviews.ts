import { createClient } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export type AuthPayload = {
  sub: string;
  [key: string]: unknown;
};

export type ReviewUser = {
  id: string;
  name: string;
  role?: string;
};

export function createAnonSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createAuthenticatedSupabaseClient(request: Request) {
  const token = getAuthTokenFromRequest(request);

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

export function getAuthTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((part) => part.trim().split("=").slice(0, 2) as [string, string])
  );

  // Try multiple Supabase cookie name patterns
  const token =
    cookies["sb-auth-token"] ||
    cookies["auth.token"] ||
    Object.entries(cookies)
      .find(([key]) => key.includes("auth-token") || key.includes("session"))?.[1] ||
    "";

  if (token) {
    console.log("[Auth] Token found from cookie");
  } else {
    console.log("[Auth] No token found. Cookies:", Object.keys(cookies));
  }

  return token;
}

export function getUserIdFromToken(token: string) {
  try {
    const decoded = jwtDecode<AuthPayload>(token);
    return decoded.sub;
  } catch {
    return "";
  }
}

export function getUserIdFromRequest(request: Request) {
  const token = getAuthTokenFromRequest(request);
  return getUserIdFromToken(token);
}

export async function getCurrentUser(request: Request): Promise<ReviewUser | null> {
  const token = getAuthTokenFromRequest(request);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return null;
  }

  const supabase = createAuthenticatedSupabaseClient(request);
  const { data } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", userId)
    .single();

  if (!data) {
    return null;
  }

  return data as ReviewUser;
}

export async function isAdminUser(request: Request) {
  const user = await getCurrentUser(request);
  return user?.role === "admin";
}

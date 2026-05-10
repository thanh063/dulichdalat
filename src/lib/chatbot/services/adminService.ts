import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export type DashboardStats = {
  users: number;
  bookings: number;
  pendingBookings: number;
  notifications: number;
};

export type AdminBooking = {
  id: number;
  user_id: string | null;
  place_name: string;
  type: "room" | "table";
  customer_name: string;
  phone: string;
  date_in: string;
  date_out: string | null;
  time: string | null;
  guests: number;
  status: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at: string;
};

export async function isAdmin(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return !error && data?.role === "admin";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { users: 0, bookings: 0, pendingBookings: 0, notifications: 0 };
  }

  const [users, bookings, pendingBookings, notifications] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("admin_notifications").select("id", { count: "exact", head: true }),
  ]);

  return {
    users: users.count ?? 0,
    bookings: bookings.count ?? 0,
    pendingBookings: pendingBookings.count ?? 0,
    notifications: notifications.count ?? 0,
  };
}

export async function getAllUsers(page = 1, limit = 20) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [] as AdminUser[];

  const start = (page - 1) * limit;
  const end = start + limit - 1;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, address, role, created_at")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error || !data) return [] as AdminUser[];
  return data as AdminUser[];
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  return !error;
}

export async function deleteUser(userId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  return !error;
}

export async function getAllBookings(page = 1, limit = 20, status?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [] as AdminBooking[];

  const start = (page - 1) * limit;
  const end = start + limit - 1;
  let query = supabase
    .from("bookings")
    .select("id, user_id, place_name, type, customer_name, phone, date_in, date_out, time, guests, status, created_at")
    .order("created_at", { ascending: false })
    .range(start, end);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error || !data) return [] as AdminBooking[];
  return data as AdminBooking[];
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
  return !error;
}

export async function deleteBooking(bookingId: number) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
  return !error;
}

export async function notifyAdminNewBooking(booking: {
  id: number;
  customer_name: string;
  phone: string;
  restaurant: string;
  guests: number;
  date: string;
  time: string;
  type: string;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return false;

  const { error } = await supabase.from("admin_notifications").insert({
    type: "new_booking",
    title: `Có đặt ${booking.type === "table" ? "bàn" : "phòng"} mới!`,
    message: `${booking.customer_name} đã đặt ${booking.type === "table" ? "bàn" : "phòng"} tại ${booking.restaurant} cho ${booking.guests} người vào ngày ${booking.date}${booking.time ? ` lúc ${booking.time}` : ""}. SĐT: ${booking.phone}`,
    booking_id: booking.id,
  });

  return !error;
}

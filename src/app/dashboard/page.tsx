import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";
import { DashboardBookingList } from "@/components/admin/dashboard-booking-list";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: number;
  place_name: string;
  customer_name: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  date_in: string;
  created_at: string;
};

type DashboardStats = {
  users: number;
  bookings: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  unreadNotifications: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default async function DashboardPage() {
  const supabase = getSupabaseAdminClient();

  const stats: DashboardStats = {
    users: 0,
    bookings: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    unreadNotifications: 0,
  };
  let recentBookings: BookingRow[] = [];

  if (supabase) {
    const [usersRes, bookingsRes, pendingRes, confirmedRes, cancelledRes, notificationsRes, recentRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
      supabase.from("admin_notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
      supabase
        .from("bookings")
        .select("id, place_name, customer_name, guests, status, date_in, created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    stats.users = usersRes.count ?? 0;
    stats.bookings = bookingsRes.count ?? 0;
    stats.pending = pendingRes.count ?? 0;
    stats.confirmed = confirmedRes.count ?? 0;
    stats.cancelled = cancelledRes.count ?? 0;
    stats.unreadNotifications = notificationsRes.count ?? 0;
    recentBookings = (recentRes.data ?? []) as BookingRow[];
  }

  const confirmationRate = stats.bookings > 0 ? Math.round((stats.confirmed / stats.bookings) * 100) : 0;
  const bookingOccupancy = stats.bookings > 0 ? Math.round((stats.confirmed + stats.pending) / stats.bookings * 100) : 0;
  const liveStatus = supabase ? "Dữ liệu real-time từ Supabase" : "Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY";

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <section className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Dashboard</p>
            <h1 className="mt-4 font-display text-5xl text-pine-900">Quản lý đặt chỗ và khách truy cập</h1>
            <p className="mt-3 text-sm leading-7 text-smoke">
              Bảng điều khiển này đang đọc trực tiếp từ Supabase: người dùng, booking, trạng thái duyệt và thông báo admin.
            </p>
          </div>
          <div className="rounded-2xl bg-pine-500/5 px-5 py-4 text-sm text-smoke">
            <p className="font-semibold text-pine-900">{liveStatus}</p>
            <p className="mt-1">Cập nhật theo dữ liệu thật của hệ thống.</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Người dùng", value: stats.users, detail: "Tài khoản trong profiles" },
          { label: "Đặt chỗ", value: stats.bookings, detail: "Tổng booking đã ghi nhận" },
          { label: "Chờ duyệt", value: stats.pending, detail: "Cần admin xử lý" },
          { label: "Thông báo chưa đọc", value: stats.unreadNotifications, detail: "Từ admin_notifications" },
        ].map((item) => (
          <article key={item.label} className="rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-smoke">{item.label}</p>
            <p className="mt-4 font-heading text-5xl text-pine-900">{formatNumber(item.value)}</p>
            <p className="mt-2 text-sm text-smoke">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-700">Phân bổ trạng thái</p>
              <h2 className="mt-2 font-display text-3xl text-pine-900">Booking theo trạng thái</h2>
            </div>
            <p className="text-sm text-smoke">Tỷ lệ xác nhận {confirmationRate}%</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Đã xác nhận", value: stats.confirmed, tone: "bg-emerald-500/10 text-emerald-700" },
              { label: "Chờ duyệt", value: stats.pending, tone: "bg-amber-500/10 text-amber-700" },
              { label: "Đã hủy", value: stats.cancelled, tone: "bg-rose-500/10 text-rose-700" },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl p-4 ${item.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em]">{item.label}</p>
                <p className="mt-2 font-heading text-3xl">{formatNumber(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-pine-500/5 p-4">
            <div className="flex items-center justify-between text-sm text-smoke">
              <span>Mức phủ booking</span>
              <span>{bookingOccupancy}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-gradient-to-r from-pine-700 to-gold" style={{ width: `${bookingOccupancy}%` }} />
            </div>
            <p className="mt-3 text-sm text-smoke">
              Chỉ số này phản ánh tỷ lệ booking đang ở trạng thái chờ hoặc đã xác nhận so với tổng booking.
            </p>
          </div>
        </article>

        <article className="rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-700">Hành động nhanh</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: "Mở API stats", href: "/api/admin/stats", detail: "Kiểm tra JSON số liệu hiện tại" },
              { label: "Xem booking", href: "/admin/bookings", detail: "Danh sách booking có drill-down" },
              { label: "Mở địa điểm", href: "/places", detail: "Quay về dữ liệu du lịch" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="rounded-2xl border border-pine-500/10 p-4 transition hover:border-pine-500/25 hover:bg-pine-500/5">
                <p className="font-semibold text-pine-900">{item.label}</p>
                <p className="mt-1 text-sm text-smoke">{item.detail}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-700">Hoạt động gần đây</p>
            <h2 className="mt-2 font-display text-3xl text-pine-900">Danh sách booking mới nhất</h2>
          </div>
          <p className="text-sm text-smoke">{recentBookings.length} bản ghi gần nhất</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-pine-500/10">
          {recentBookings.length > 0 ? (
            <DashboardBookingList bookings={recentBookings} />
          ) : (
            <div className="px-5 py-10 text-sm text-smoke">
              Chưa có booking nào. Khi có dữ liệu Supabase, danh sách recent bookings sẽ xuất hiện ở đây.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
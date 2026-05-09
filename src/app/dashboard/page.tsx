import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Dashboard</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Quản lý đặt chỗ và khách truy cập</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-smoke">
          Dashboard nền tảng đã sẵn sàng để kết nối Supabase stats, bookings và notification. Khi có tài khoản admin, bạn có thể mở rộng trang này thành trung tâm vận hành.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ["Người dùng", "—"],
          ["Đặt chỗ mới", "—"],
          ["Chờ duyệt", "—"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-smoke">{label}</p>
            <p className="mt-4 font-heading text-5xl text-pine-900">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-8">
        <Link href="/places" className="rounded-full bg-pine-700 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900">
          Về trang địa điểm
        </Link>
      </div>
    </div>
  );
}
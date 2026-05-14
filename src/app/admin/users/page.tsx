import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export const dynamic = "force-dynamic";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at: string;
};

export default async function AdminUsersPage() {
  const supabase = getSupabaseAdminClient();
  let users: AdminUserRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, phone, address, role, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    users = (data ?? []) as AdminUserRow[];
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <section className="rounded-4xl border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Admin · Users</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Quản lý Users</h1>
        <p className="mt-3 text-sm leading-7 text-smoke">
          Danh sách tài khoản trong hệ thống để kiểm tra thông tin và vai trò.
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-4xl border border-pine-500/10 bg-white shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
        <div className="flex items-center justify-between gap-4 border-b border-pine-500/10 px-6 py-5">
          <div>
            <h2 className="font-display text-3xl text-pine-900">Tài khoản gần đây</h2>
            <p className="mt-1 text-sm text-smoke">Hiển thị 25 tài khoản mới nhất</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-pine-700 hover:text-pine-900">
            ← Về dashboard
          </Link>
        </div>

        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-pine-500/10">
              <thead className="bg-pine-500/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-smoke">SĐT</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Vai trò</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pine-500/10 bg-white">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 text-sm font-semibold text-pine-900">{user.name}</td>
                    <td className="px-4 py-4 text-sm text-charcoal">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-smoke">{user.phone}</td>
                    <td className="px-4 py-4 text-sm text-smoke">{user.role}</td>
                    <td className="px-4 py-4 text-sm text-smoke">{new Date(user.created_at).toLocaleDateString("vi-VN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-smoke">Chưa có dữ liệu users hoặc Supabase chưa cấu hình.</div>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RegisterFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = (await response.json()) as { success: boolean; message: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message);
      }

      router.push("/login");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Đăng ký thất bại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl gap-8 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:px-12">
      <div className="hidden overflow-hidden rounded-[2rem] bg-[url('/images/dalat2.png')] bg-cover bg-center lg:block" />
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Đăng ký</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Tạo tài khoản mới</h1>
        <p className="mt-3 text-sm text-smoke">Lưu lịch trình, chat AI và quản lý đặt chỗ trong một tài khoản duy nhất.</p>

        <div className="mt-8 space-y-4">
          <Field label="Họ tên" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <Field label="Số điện thoại" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <Field label="Mật khẩu" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
          <Field label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} />
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900 disabled:opacity-60"
        >
          {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>

        <p className="mt-6 text-sm text-smoke">
          Đã có tài khoản? <Link href="/login" className="font-semibold text-pine-700">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-charcoal">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-pine-500/15 px-5 text-sm outline-none focus:border-pine-500"
      />
    </label>
  );
}
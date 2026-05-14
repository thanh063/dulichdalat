"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewRow = {
  id: number;
  place_slug: string;
  place_name: string;
  user_name: string;
  avatar_url: string;
  rating: number;
  content: string;
  image_url: string | null;
  approved: boolean;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pendingCount = useMemo(() => reviews.filter((review) => !review.approved).length, [reviews]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/admin/reviews", { cache: "no-store", credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to load reviews");
        }
        const data = (await response.json()) as { reviews?: ReviewRow[] };
        setReviews(data.reviews ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải review");
      } finally {
        setLoading(false);
      }
    }

    void loadReviews();
  }, []);

  async function approveReview(id: number, approved: boolean) {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      setReviews((current) => current.map((review) => (review.id === id ? { ...review, approved } : review)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật review");
    }
  }

  async function deleteReview(id: number) {
    if (!window.confirm("Bạn chắc chắn muốn xóa review này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews((current) => current.filter((review) => review.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa review");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
      <section className="rounded-4xl border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Admin · Đánh giá</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Quản lý review địa điểm</h1>
        <p className="mt-3 text-sm leading-7 text-smoke">Duyệt, ẩn hoặc xóa review do người dùng gửi lên.</p>
        <p className="mt-4 rounded-2xl bg-pine-500/5 px-4 py-3 text-sm text-smoke">Đang chờ duyệt: <span className="font-semibold text-pine-900">{pendingCount}</span></p>
      </section>

      <section className="mt-8 space-y-4">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {loading ? (
          <div className="rounded-3xl border border-pine-500/10 bg-white p-6 text-smoke">Đang tải review...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-pine-500/10 bg-white p-6 text-smoke">Chưa có review nào.</div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-pine-500/10 bg-white p-5 shadow-[0_12px_30px_rgba(26,47,15,0.05)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                  <img src={review.avatar_url} alt={review.user_name} className="h-12 w-12 rounded-full border border-pine-500/10 object-cover" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-2xl text-pine-900">{review.place_name}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.approved ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {review.approved ? "Đã duyệt" : "Chờ duyệt"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-smoke">{review.user_name} · {new Date(review.created_at).toLocaleDateString("vi-VN")}</p>
                    <p className="mt-1 text-sm font-semibold text-gold">{review.rating}★</p>
                    <p className="mt-3 max-w-4xl text-sm leading-7 text-charcoal">{review.content}</p>
                    {review.image_url ? <img src={review.image_url} alt={`Ảnh review ${review.place_name}`} className="mt-4 max-h-72 rounded-2xl object-cover" /> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
                  <button
                    type="button"
                    onClick={() => approveReview(review.id, !review.approved)}
                    className="rounded-full border border-pine-500/20 px-4 py-2 text-sm font-semibold text-pine-700 transition hover:bg-pine-500/5"
                  >
                    {review.approved ? "Bỏ duyệt" : "Duyệt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(review.id)}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

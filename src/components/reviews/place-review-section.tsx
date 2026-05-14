"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type ReviewStats = {
  average: number;
  total: number;
  distribution: Array<{ rating: number; count: number }>;
};

type ReviewRow = {
  id: number;
  place_slug: string;
  user_id: string;
  rating: number;
  content: string;
  image_url: string | null;
  approved: boolean;
  created_at: string;
  user_name: string;
  avatar_url: string;
};

type ReviewResponse = {
  stats: ReviewStats;
  reviews: ReviewRow[];
  currentUserReview: ReviewRow | null;
  canReview: boolean;
  isAuthenticated: boolean;
};

type UserData = { id: string; name: string; role?: string };

function subscribeToUserChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readStoredUserSnapshot() {
  return window.localStorage.getItem("dalat_user");
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-500" aria-label={`${value.toFixed(1)} sao`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < Math.round(value) ? "text-amber-500" : "text-stone-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function buildAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

export default function PlaceReviewSection({ slug, placeName }: { slug: string; placeName: string }) {
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userSnapshot = useSyncExternalStore(subscribeToUserChanges, readStoredUserSnapshot, () => null);
  const user = useMemo<UserData | null>(() => {
    if (!userSnapshot) {
      console.log("[Review Form] No user snapshot found");
      return null;
    }
    try {
      const parsed = JSON.parse(userSnapshot) as UserData;
      console.log("[Review Form] User loaded:", parsed);
      return parsed;
    } catch (e) {
      console.error("[Review Form] Failed to parse user:", e);
      return null;
    }
  }, [userSnapshot]);

  const averageRating = reviewData?.stats.average ?? 0;
  const totalReviews = reviewData?.stats.total ?? 0;

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch(`/api/places/${slug}/reviews`, { cache: "no-store", credentials: "include" });
        if (!response.ok) {
          throw new Error("Failed to load reviews");
        }
        const data = (await response.json()) as ReviewResponse;
        setReviewData(data);
        if (data.currentUserReview) {
          setSuccess("Bạn đã gửi đánh giá cho địa điểm này.");
        }
      } catch (loadError) {
        console.error(loadError);
        setError("Không thể tải đánh giá");
      } finally {
        setLoading(false);
      }
    }

    void loadReviews();
  }, [slug]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageUrl("");
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(result);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Bạn cần đăng nhập để đánh giá.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/places/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rating,
          content,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error || "Không thể gửi đánh giá");
      }

      setRating(5);
      setContent("");
      setImageUrl("");
      setImagePreview("");
      setSuccess(data.message || "Đã gửi đánh giá, chờ duyệt");

      const refreshed = await fetch(`/api/places/${slug}/reviews`, { cache: "no-store", credentials: "include" });
      if (refreshed.ok) {
        const nextData = (await refreshed.json()) as ReviewResponse;
        setReviewData(nextData);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12 rounded-4xl border border-pine-500/10 bg-white p-6 shadow-[0_20px_60px_rgba(26,47,15,0.08)] lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Đánh giá địa điểm</p>
          <h2 className="mt-3 font-display text-4xl text-pine-900">{placeName}</h2>
          <p className="mt-2 text-sm text-smoke">Đánh giá từ cộng đồng du lịch và nhận xét thực tế từ người dùng.</p>
        </div>
        <div className="rounded-3xl bg-pine-500/5 px-5 py-4 text-right">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-4xl font-display text-pine-900">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-smoke">{totalReviews} đánh giá</p>
            </div>
            <div>
              <StarRating value={averageRating} />
              <p className="mt-1 text-xs text-smoke">Điểm trung bình từ review đã duyệt</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-pine-500/10 bg-pine-50/60 p-5">
          <h3 className="font-heading text-2xl text-pine-900">Phân bố số sao</h3>
          <div className="mt-5 space-y-4">
            {(reviewData?.stats.distribution ?? [5, 4, 3, 2, 1].map((ratingValue) => ({ rating: ratingValue, count: 0 }))).map((item) => {
              const percent = totalReviews > 0 ? (item.count / totalReviews) * 100 : 0;
              return (
                <div key={item.rating} className="flex items-center gap-3 text-sm">
                  <div className="w-12 font-semibold text-charcoal">{item.rating}★</div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="w-10 text-right text-smoke">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-2xl text-pine-900">Danh sách review</h3>
          <div className="mt-5 space-y-4">
            {loading ? (
              <p className="text-smoke">Đang tải review...</p>
            ) : (reviewData?.reviews.length ?? 0) === 0 ? (
              <p className="text-smoke">Chưa có review nào cho địa điểm này.</p>
            ) : (
              reviewData!.reviews.map((review) => (
                <article key={review.id} className="rounded-3xl border border-pine-500/10 bg-white p-4 shadow-[0_12px_30px_rgba(26,47,15,0.05)]">
                  <div className="flex items-start gap-4">
                    <img src={review.avatar_url || buildAvatarUrl(review.user_name)} alt={review.user_name} className="h-12 w-12 rounded-full border border-pine-500/10 bg-white object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-charcoal">{review.user_name}</p>
                          <p className="text-xs text-smoke">{new Date(review.created_at).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <StarRating value={review.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-7 text-smoke">{review.content}</p>
                      {review.image_url ? (
                        <img src={review.image_url} alt={`Ảnh review của ${review.user_name}`} className="mt-4 max-h-72 w-full rounded-2xl object-cover" />
                      ) : null}
                      {!review.approved ? (
                        <span className="mt-3 inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">Chờ duyệt</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-pine-500/10 bg-white p-5 shadow-[0_12px_30px_rgba(26,47,15,0.05)]">
        {!user ? (
          <p className="text-sm text-smoke">Chỉ user đăng nhập mới có thể đánh giá.</p>
        ) : reviewData?.currentUserReview ? (
          <p className="text-sm text-smoke">Bạn đã đánh giá địa điểm này rồi. Mỗi user chỉ được đánh giá 1 lần.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-charcoal">Chọn sao:</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  const active = value <= rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`text-3xl transition ${active ? "text-gold" : "text-stone-300 hover:text-gold/60"}`}
                      aria-label={`${value} sao`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-smoke">{rating} sao</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal">Nhận xét</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={5}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                className="mt-2 w-full rounded-2xl border border-pine-500/15 px-4 py-3 outline-none transition focus:border-pine-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal">Upload ảnh</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm text-smoke file:mr-4 file:rounded-full file:border-0 file:bg-pine-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cream hover:file:bg-pine-900" />
              {imagePreview ? <img src={imagePreview} alt="Xem trước ảnh review" className="mt-4 max-h-64 rounded-2xl object-cover" /> : null}
            </div>

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900 disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

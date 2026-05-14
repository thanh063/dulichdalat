"use client";

import { useEffect, useState } from "react";

export default function FavoriteButton({ slug, size = "md" }: { slug: string; size?: "sm" | "md" }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await fetch("/api/user/favorites", { cache: "no-store", credentials: "include" });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!mounted) return;
        const favs: { place_slug: string }[] = data.favorites ?? [];
        setIsFav(favs.some((f) => f.place_slug === slug));
      } catch {
        // ignore
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  function isAuthenticated() {
    try {
      if (typeof window === "undefined") return false;
      const raw = window.localStorage.getItem("dalat_user");
      return !!raw;
    } catch {
      return false;
    }
  }

  async function toggle() {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);
    try {
      if (!isFav) {
        const resp = await fetch("/api/user/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ place_slug: slug }) });
        if (!resp.ok) throw new Error("Không thể thêm yêu thích");
        setIsFav(true);
      } else {
        const resp = await fetch(`/api/user/favorites/${encodeURIComponent(slug)}`, { method: "DELETE", credentials: "include" });
        if (!resp.ok) throw new Error("Không thể gỡ khỏi yêu thích");
        setIsFav(false);
      }
    } catch {
      // fallback: show login if auth issue
      setShowLoginPrompt(true);
    } finally {
      setLoading(false);
    }
  }

  const sizeClass = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        title={isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
        className={`inline-flex items-center justify-center rounded-full border border-pine-500/10 bg-white px-3 py-2 text-pine-900 shadow-sm transition hover:bg-pine-500/5 ${sizeClass}`}
      >
        <span aria-hidden className="mr-1">{isFav ? "♥" : "♡"}</span>
        <span className="sr-only">{isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}</span>
      </button>

      {showLoginPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <p className="mb-4 text-sm">Bạn cần đăng nhập để sử dụng tính năng yêu thích.</p>
            <div className="flex gap-3">
              <a href="/login" className="rounded-full bg-pine-700 px-4 py-2 text-sm font-semibold text-cream">Đăng nhập</a>
              <button className="rounded-full border border-pine-500/20 px-4 py-2 text-sm font-semibold" onClick={() => setShowLoginPrompt(false)}>Đóng</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

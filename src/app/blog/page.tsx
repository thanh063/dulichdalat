"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string;
  author?: { name: string } | null;
  created_at: string;
  tags: string[];
  view_count: number;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch("/api/blog/posts");
        if (!response.ok) throw new Error("Failed to load posts");
        const data = (await response.json()) as { posts?: BlogPost[] };
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error loading blog posts:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, []);

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      {/* Header */}
      <section className="rounded-4xl border border-pine-500/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Khám Phá & Chia Sẻ</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Blog Du Lịch Đà Lạt</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-smoke">
          Cập nhật kinh nghiệm du lịch, mẹo hữu ích, và những điểm đến không thể bỏ lỡ ở Đà Lạt.
        </p>
      </section>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 text-sm font-semibold text-charcoal">Lọc theo tag:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedTag === null
                  ? "bg-pine-700 text-cream"
                  : "border border-pine-500/20 text-charcoal hover:bg-pine-500/5"
              }`}
            >
              Tất cả
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedTag === tag
                    ? "bg-pine-700 text-cream"
                    : "border border-pine-500/20 text-charcoal hover:bg-pine-500/5"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="mt-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-smoke">Đang tải bài viết...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-smoke">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-3xl border border-pine-500/10 bg-white overflow-hidden shadow-[0_16px_42px_rgba(26,47,15,0.06)] transition hover:shadow-[0_24px_80px_rgba(26,47,15,0.12)]"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-pine-500/10 px-2.5 py-1 text-xs font-semibold text-pine-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-heading text-xl text-pine-900 hover:text-pine-700 transition line-clamp-2 cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="mt-2 text-sm leading-6 text-smoke line-clamp-2">{post.excerpt}</p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between border-t border-pine-500/10 pt-4 text-xs text-smoke">
                    <div>
                      {post.author?.name && <span>{post.author.name}</span>}
                      {post.author?.name && <span> • </span>}
                      <time>{new Date(post.created_at).toLocaleDateString("vi-VN")}</time>
                    </div>
                    <span>👁️ {post.view_count}</span>
                  </div>

                  {/* Read More */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-pine-700 hover:text-pine-900 transition"
                  >
                    Đọc tiếp → 
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

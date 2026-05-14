"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string[];
  published: boolean;
  created_at: string;
  author?: { name: string } | null;
};

type FormData = {
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  tags: string;
  published: boolean;
};

type UserData = { role?: string };

function subscribeToUserStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getUserSnapshot() {
  return window.localStorage.getItem("dalat_user");
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    excerpt: "",
    cover_image: "",
    tags: "",
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const userSnapshot = useSyncExternalStore(subscribeToUserStorage, getUserSnapshot, () => null);
  const user = useMemo<UserData | null>(() => {
    if (!userSnapshot) return null;

    try {
      return JSON.parse(userSnapshot) as UserData;
    } catch {
      return null;
    }
  }, [userSnapshot]);

  useEffect(() => {
    if (!user) {
      void router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      void router.push("/");
    }
  }, [router, user]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function loadPosts() {
      try {
        const response = await fetch("/api/admin/blog", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to load posts");
        const data = (await response.json()) as { posts?: BlogPost[] };
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error loading posts:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const error_data = (await response.json()) as { error?: string };
        throw new Error(error_data.error || "Failed to save post");
      }

      const result = (await response.json()) as { post?: BlogPost };
      if (editingId) {
        setPosts(posts.map((p) => (p.id === editingId ? result.post! : p)));
      } else {
        setPosts([result.post!, ...posts]);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        cover_image: "",
        tags: "",
        published: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Bạn chắc chắn muốn xóa bài viết này?")) return;

    try {
      const response = await fetch(`/api/admin/blog/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete post");
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post");
    }
  }

  function handleEdit(post: BlogPost) {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      tags: post.tags.join(", "),
      published: post.published,
    });
    setShowForm(true);
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-smoke">Không có quyền truy cập.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-pine-900">Quản Lý Blog</h1>
          <p className="mt-2 text-smoke">Tạo, chỉnh sửa, và xóa bài viết blog</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editingId) setEditingId(null);
            if (!showForm) {
              setFormData({
                title: "",
                content: "",
                excerpt: "",
                cover_image: "",
                tags: "",
                published: false,
              });
            }
          }}
          className="rounded-full bg-pine-700 px-6 py-3 font-semibold text-cream transition hover:bg-pine-900"
        >
          {showForm ? "Hủy" : "+ Bài Viết Mới"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-3xl border border-pine-500/10 bg-white/80 p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="block text-sm font-semibold text-charcoal">Tiêu Đề</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-1 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal">Nội Dung (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={10}
                className="mt-1 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 font-mono text-sm outline-none transition focus:border-pine-500"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-charcoal">Mô Tả Ngắn</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal">URL Ảnh Bìa</label>
                <input
                  type="url"
                  value={formData.cover_image}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal">Tags (Cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="du-lich, da-lat, tip"
                className="mt-1 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-pine-500/20"
                />
                <span className="text-sm font-semibold text-charcoal">Xuất bản</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-pine-700 px-6 py-2 font-semibold text-cream transition hover:bg-pine-900 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : editingId ? "Cập Nhật" : "Tạo Bài Viết"}
            </button>
          </form>
        </div>
      )}

      {/* Posts Table */}
      <div className="rounded-3xl border border-pine-500/10 bg-white/80 shadow-[0_16px_42px_rgba(26,47,15,0.06)] overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-smoke">Đang tải...</div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-smoke">Chưa có bài viết nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pine-500/10 bg-pine-50">
                  <th className="px-6 py-3 text-left font-semibold text-charcoal">Tiêu Đề</th>
                  <th className="px-6 py-3 text-left font-semibold text-charcoal">Slug</th>
                  <th className="px-6 py-3 text-left font-semibold text-charcoal">Trạng Thái</th>
                  <th className="px-6 py-3 text-left font-semibold text-charcoal">Ngày Tạo</th>
                  <th className="px-6 py-3 text-right font-semibold text-charcoal">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-pine-500/10 hover:bg-pine-50/30">
                    <td className="px-6 py-3 font-semibold text-charcoal">{post.title}</td>
                    <td className="px-6 py-3 text-smoke">{post.slug}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          post.published
                            ? "bg-green-50 text-green-700"
                            : "bg-stone-100 text-smoke"
                        }`}
                      >
                        {post.published ? "Đã xuất bản" : "Nháp"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-smoke">
                      {new Date(post.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleEdit(post)}
                        className="mr-3 text-pine-700 hover:text-pine-900 transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

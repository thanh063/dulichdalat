import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the current post to find its tags
    const { data: currentPost, error: currentError } = await supabase
      .from("blog_posts")
      .select("id, tags")
      .eq("slug", slug)
      .single();

    if (currentError || !currentPost) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (!currentPost.tags || currentPost.tags.length === 0) {
      // If no tags, return recent posts
      const { data: recentPosts } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt")
        .eq("published", true)
        .neq("id", currentPost.id)
        .order("created_at", { ascending: false })
        .limit(5);

      return Response.json({ related: recentPosts || [] });
    }

    // Find posts with similar tags
    const { data: relatedPosts } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, tags")
      .eq("published", true)
      .neq("id", currentPost.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Score posts by tag overlap
    const scored = (relatedPosts || [])
      .map((post) => ({
        ...post,
        score: (post.tags || []).filter((tag: string) =>
          currentPost.tags.includes(tag)
        ).length,
      }))
      .filter((post) => post.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...post }) => {
        void score;
        return post;
      });

    // If less than 5, fill with recent posts
    if (scored.length < 5) {
      const { data: recent } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, tags")
        .eq("published", true)
        .neq("id", currentPost.id)
        .not("id", "in", `(${scored.map((p) => p.id).join(",")})`)
        .order("created_at", { ascending: false })
        .limit(5 - scored.length);

      scored.push(...(recent || []));
    }

    return Response.json({ related: scored });
  } catch (error) {
    console.error("Error loading related posts:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

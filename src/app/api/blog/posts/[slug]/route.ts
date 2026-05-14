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

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, author:author_id(id, name)")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from("blog_posts")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id);

    return Response.json({ post: data });
  } catch (error) {
    console.error("Error loading post:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

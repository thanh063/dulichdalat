import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, slug, cover_image, tags, created_at, view_count, author:author_id(name)")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ posts: [] });
    }

    return Response.json({ posts: data || [] });
  } catch (error) {
    console.error("Error loading posts:", error);
    return Response.json({ posts: [] });
  }
}

import places from "@/data/dalat.json";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/reviews";

type ReviewRow = {
  id: number;
  place_slug: string;
  user_id: string;
  user_name: string;
  rating: number;
  content: string;
  image_url: string | null;
  approved: boolean;
  created_at: string;
};

type PlaceRecord = {
  slug: string;
  name: string;
};

const placeMap = new Map((places as PlaceRecord[]).map((place) => [place.slug, place.name]));

function buildAvatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("place_reviews")
    .select("id, place_slug, user_id, rating, content, image_url, approved, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: "Failed to load reviews" }, { status: 500 });
  }

  const reviews = (data ?? []) as ReviewRow[];

  return Response.json({
    reviews: reviews.map((review) => ({
      ...review,
      place_name: placeMap.get(review.place_slug) ?? review.place_slug,
      user_name: review.user_name,
      avatar_url: buildAvatarUrl(review.user_name),
    })),
  });
}

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

type ItineraryDay = {
  date: string;
  places: string[];
};

type ItineraryData = {
  days?: ItineraryDay[];
};

export default async function SharedItineraryPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return <div>Cấu hình lỗi</div>;
  }

  const client = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await client
    .from("itineraries")
    .select("id, title, start_date, duration_days, itinerary_data, created_at")
    .eq("share_token", shareToken)
    .eq("is_public", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const itineraryData = data.itinerary_data as ItineraryData;
  const days = itineraryData.days || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      {/* Header */}
      <section className="rounded-[2rem] border border-pine-500/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Lịch Trình Chia Sẻ</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">{data.title}</h1>
        <div className="mt-4 flex gap-4 text-sm text-smoke">
          <span>📅 {new Date(data.start_date).toLocaleDateString("vi-VN")}</span>
          <span>⏱️ {data.duration_days} ngày</span>
          <span>👤 Chia sẻ vào {new Date(data.created_at).toLocaleDateString("vi-VN")}</span>
        </div>
      </section>

      {/* Itinerary */}
      <div className="mt-10 space-y-6">
        {days.map((day, dayIndex) => (
          <section
            key={day.date}
            className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]"
          >
            <div className="flex items-center gap-4 border-b border-pine-500/10 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-700 text-lg font-bold text-cream">
                {dayIndex + 1}
              </div>
              <div>
                <h2 className="font-heading text-2xl text-pine-900">Ngày {dayIndex + 1}</h2>
                <p className="text-sm text-smoke">{new Date(day.date).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {day.places.map((place, placeIndex) => (
                <div
                  key={`${dayIndex}-${placeIndex}`}
                  className="flex items-start gap-4 rounded-lg bg-stone-50 p-4"
                >
                  <div className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-pine-700/20 text-sm font-bold text-pine-700">
                    {placeIndex + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{place}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <section className="mt-10 rounded-[2rem] border border-pine-500/10 bg-stone-50 p-8 text-center">
        <p className="text-sm text-smoke">
          Bạn muốn tạo lịch trình của riêng bạn?{" "}
          <Link href="/dat-tour" className="font-semibold text-pine-700 hover:underline">
            Bắt đầu ngay →
          </Link>
        </p>
      </section>
    </div>
  );
}

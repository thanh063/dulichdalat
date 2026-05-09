import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import places from "@/data/dalat.json";

type PlaceRecord = {
  slug: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  hours: string;
  description: string;
  tags: string[];
  image: string;
};

const placeItems = places as PlaceRecord[];

export function generateStaticParams() {
  return placeItems.map((place) => ({ slug: place.slug }));
}

export default async function PlaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = placeItems.find((item) => item.slug === slug);

  if (!place) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-pine-500/10 bg-white shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <Image src={place.image} alt={place.name} width={1200} height={675} className="h-full w-full object-cover" priority />
        </div>
        <div className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">{place.category}</p>
          <h1 className="mt-3 font-display text-5xl text-pine-900">{place.name}</h1>
          <p className="mt-3 text-sm text-smoke">{place.address}</p>
          <div className="mt-5 flex items-center gap-4 text-sm text-smoke">
            <span>⭐ {place.rating.toFixed(1)}</span>
            <span>{place.reviewCount} đánh giá</span>
            <span>{place.hours}</span>
          </div>
          <p className="mt-6 text-base leading-8 text-smoke">{place.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-pine-500/5 px-3 py-1 text-xs font-semibold text-pine-700">
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/chat?prompt=${encodeURIComponent(`Hỏi AI về ${place.name}`)}`} className="rounded-full bg-pine-700 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900">
              Hỏi AI về nơi này
            </Link>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " Đà Lạt")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-pine-500/20 px-5 py-3 text-sm font-semibold text-pine-700 transition hover:bg-pine-500/5"
            >
              Mở bản đồ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-6 py-12 sm:px-10 lg:px-12">
      <div className="grid gap-8 rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[2rem] bg-[url('/images/dalat5.png')] bg-cover bg-center opacity-70">
          <Image src="/images/dalat5.png" alt="Đà Lạt" width={1200} height={675} className="invisible" priority />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Lạc đường ở Đà Lạt rồi? 🌿</p>
          <h1 className="mt-4 font-display text-5xl text-pine-900">Trang này không tồn tại, nhưng Đà Lạt vẫn đẹp lắm!</h1>
          <p className="mt-3 text-sm leading-7 text-smoke">Hãy quay về trang chủ để tiếp tục khám phá các địa điểm, lịch trình và chatbot AI.</p>
          <Link href="/" className="mt-6 inline-flex w-fit rounded-full bg-pine-700 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
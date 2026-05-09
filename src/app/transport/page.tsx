export default function TransportPage() {
  const items = [
    ["Xe máy", "Phù hợp đi trung tâm, đồi chè và các cung ngắn trong ngày."],
    ["Ô tô", "Thích hợp gia đình, nhóm bạn hoặc đi các điểm xa trung tâm."],
    ["Xe đạp", "Rất hợp cho buổi sáng se lạnh quanh hồ và đồi thông."],
    ["Grabbike", "Nhanh, gọn, dùng tốt cho các chặng ngắn trong thành phố."],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Di chuyển tại Đà Lạt</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Chọn phương tiện phù hợp cho từng hành trình</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-smoke">
          Đà Lạt có nhiều loại địa hình khác nhau. Chọn xe phù hợp giúp bạn tiết kiệm thời gian, chủ động lịch trình và dễ dừng ở các điểm ngắm cảnh.
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map(([title, description]) => (
          <article key={title} className="rounded-[2rem] border border-pine-500/10 bg-cream p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
            <h2 className="font-heading text-3xl text-pine-900">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-smoke">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(74,124,40,0.12),_transparent_35%),linear-gradient(180deg,#fffdfa_0%,#faf8f3_100%)]">
      {/* SECTION 1 — HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,47,15,0.62),rgba(26,47,15,0.38)_50%,rgba(26,47,15,0.72))]" />
        <div className="absolute inset-0 bg-[url('/images/dalat1.svg')] bg-cover bg-center opacity-25" />
        <div className="mx-auto flex min-h-[92vh] w-full max-w-7xl items-center px-6 py-24 sm:px-10 lg:px-12">
          <div className="relative z-10 max-w-3xl text-cream">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-2 text-sm font-semibold tracking-[0.35em] text-gold uppercase backdrop-blur-sm animate-fade-in-up">
              ✦ Thành phố ngàn hoa ✦
            </p>
            <h1 className="font-display text-6xl leading-none tracking-tight sm:text-7xl lg:text-8xl animate-fade-in-up delay-100">
              Đà Lạt
            </h1>
            <h2 className="mt-4 font-heading text-2xl text-mist-300 sm:text-3xl animate-fade-in-up delay-200">
              Nơi sương mù chạm đỉnh ngàn thông
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-cream/84 sm:text-lg animate-fade-in-up delay-300">
              Thành phố ở độ cao 1.500m với khí hậu mát lành quanh năm, những đồi hoa
              muôn sắc và hàng trăm quán cà phê lãng mạn để bạn khám phá cùng trợ lý AI.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-fade-in-up delay-400">
              <Link
                href="/itinerary"
                className="inline-flex items-center justify-center rounded-full bg-pine-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-pine-700"
              >
                Lên lịch trình với AI
              </Link>
              <Link
                href="/places"
                className="inline-flex items-center justify-center rounded-full border border-cream/60 px-8 py-4 text-base font-semibold text-cream transition hover:bg-cream/10"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — STATS */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:px-10 lg:grid-cols-4 lg:px-12">
        {[
          ["1.500m", "Độ cao trung bình"],
          ["300+", "Loài hoa bản địa"],
          ["500+", "Quán cà phê"],
          ["18°C", "Nhiệt độ trung bình"],
        ].map(([value, label]) => (
          <article
            key={value}
            className="rounded-[2rem] border border-pine-500/10 bg-white/85 p-6 shadow-[0_20px_60px_rgba(26,47,15,0.08)] backdrop-blur"
          >
            <p className="font-heading text-4xl text-pine-900">{value}</p>
            <p className="mt-2 text-sm text-smoke">{label}</p>
          </article>
        ))}
      </section>

      {/* SECTION 3 — GIỚI THIỆU 2 CỘT */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:px-12 lg:py-24">
        <div className="overflow-hidden rounded-[2rem] border border-pine-500/10 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <div className="aspect-square bg-[url('/images/dalat2.svg')] bg-cover bg-center" />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Về Đà Lạt</p>
          <h2 className="font-display text-5xl text-pine-900">Viên Ngọc Của Tây Nguyên</h2>
          <p className="text-base leading-8 text-smoke">
            Đà Lạt được người Pháp xây dựng từ cuối thế kỷ 19 như thành phố nghỉ dưỡng trên cao nguyên Lâm Viên.
            Với kiến trúc biệt thự Pháp cổ kính, rừng thông vi vu, hồ Xuân Hương thơ mộng và không khí se lạnh
            quanh năm — Đà Lạt là điểm đến không thể bỏ qua.
          </p>
          <ul className="space-y-3 text-sm text-smoke">
            {[
              "🌿 Khí hậu mát lành 15–25°C quanh năm",
              "🌿 Hơn 300 loài hoa đặc hữu cao nguyên",
              "🌿 Kiến trúc Pháp cổ điển độc đáo",
              "🌿 Ẩm thực: bánh mì xíu mại, bơ, dâu tây",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 4 — DANH MỤC 6 TILES */}
      <section className="mx-auto px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Danh Mục</p>
        <h2 className="mt-4 text-center font-display text-5xl text-pine-900">Khám phá theo sở thích</h2>
        <div className="mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-3 md:grid-rows-2">
          {[
            { icon: "🏔️", title: "Địa Điểm Tham Quan", desc: "Hồ Xuân Hương, Đồi Chè, Thung Lũng Tình Yêu", href: "/places" },
            { icon: "☕", title: "Cà Phê Sống Ảo", desc: "Mê Linh, The Married Beans, Là Việt", href: "#" },
            { icon: "🍜", title: "Ẩm Thực Địa Phương", desc: "Bánh tráng nướng, lẩu bò, sữa đậu nành", href: "#" },
            { icon: "🏨", title: "Lưu Trú", desc: "Homestay, villa, resort đủ mức giá", href: "#" },
            { icon: "🚗", title: "Di Chuyển", desc: "Xe máy, ô tô, xe đạp, grabbike", href: "#" },
            { icon: "📸", title: "Góc Chụp Ảnh", desc: "Check-in triệu like tại Đà Lạt", href: "#" },
          ].map((item) =>
            item.href === "#" ? (
              <a
                key={item.title}
                href={item.href}
                className="group rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)] transition hover:border-pine-500/25 hover:shadow-[0_24px_60px_rgba(26,47,15,0.12)]"
              >
                <p className="text-4xl">{item.icon}</p>
                <h3 className="mt-4 font-heading text-2xl text-pine-900">{item.title}</h3>
                <p className="mt-2 text-sm text-smoke">{item.desc}</p>
              </a>
            ) : (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)] transition hover:border-pine-500/25 hover:shadow-[0_24px_60px_rgba(26,47,15,0.12)]"
              >
                <p className="text-4xl">{item.icon}</p>
                <h3 className="mt-4 font-heading text-2xl text-pine-900">{item.title}</h3>
                <p className="mt-2 text-sm text-smoke">{item.desc}</p>
              </Link>
            )
          )}
        </div>
      </section>

      {/* SECTION 5 — CHATBOT CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-r from-pine-900 to-pine-700 p-8 shadow-[0_20px_60px_rgba(26,47,15,0.2)] lg:p-12">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,transparent_20%,black_100%)]" />
          </div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-5xl text-cream">Để AI Lên Lịch Trình Cho Bạn</h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-mist-300">
                Chỉ cần cho biết bạn đi mấy ngày, đi với ai, ngân sách bao nhiêu — chatbot tạo lịch trình
                chi tiết theo ý bạn trong vài giây.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-cream/80">
                {[
                  "✦ Gợi ý địa điểm theo sở thích",
                  "✦ Đặt bàn nhà hàng, phòng lưu trú",
                  "✦ Tính chi phí ước tính cả chuyến",
                  "✦ Xuất lịch trình ra file TXT",
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                href="/itinerary"
                className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine-900 transition hover:bg-gold/90"
              >
                Bắt đầu chat ngay →
              </a>
            </div>
            <div className="hidden space-y-3 lg:flex lg:flex-col lg:justify-center">
              {[
                { role: "bot", text: "Mình có thể lên lịch trình cho bạn trong vài giây!" },
                { role: "user", text: "Đi 3 ngày 2 đêm với bạn gái, thích cà phê và thiên nhiên" },
                { role: "bot", text: "Tuyệt vời! Để mình gợi ý lịch chi tiết..." },
              ].map((msg, idx) => (
                <div
                  key={idx}
                  className={`rounded-[1.5rem] px-4 py-3 text-sm ${
                    msg.role === "bot"
                      ? "rounded-tl-none border border-cream/20 bg-cream/10 text-mist-300"
                      : "rounded-tr-none ml-auto max-w-xs bg-cream/20 text-cream"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ĐỊA ĐIỂM NỔI BẬT */}
      <section className="mx-auto px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Không Thể Bỏ Lỡ</p>
        <h2 className="mt-4 text-center font-display text-5xl text-pine-900">Những điểm đến huyền thoại</h2>
        <div className="mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Hồ Xuân Hương",
              rating: "4.7",
              desc: "Hồ nước ngọt lớn nhất Đà Lạt, bao quanh rừng thông và hoa mimosa vàng mùa xuân.",
              tags: ["Thiên nhiên", "Check-in"],
            },
            {
              name: "Đồi Chè Cầu Đất",
              rating: "4.8",
              desc: "Đồi chè xanh mướt ở độ cao 1.650m, sương mù buổi sáng tạo cảnh như trời Âu.",
              tags: ["Săn mây", "Thiên nhiên"],
            },
            {
              name: "Thung Lũng Tình Yêu",
              rating: "4.5",
              desc: "Thung lũng xanh với hồ Đa Thiện, vườn hoa đủ màu — điểm đến lý tưởng cho cặp đôi.",
              tags: ["Lãng mạn", "Cặp đôi"],
            },
            {
              name: "Ga Đà Lạt",
              rating: "4.9",
              desc: "Nhà ga đẹp nhất Đông Dương, xây 1938, mái nhọn 3 chóp Pháp độc đáo.",
              tags: ["Lịch sử", "Kiến trúc"],
            },
            {
              name: "Núi LangBiang",
              rating: "4.6",
              desc: "Ngọn núi cao nhất vùng (2.169m), leo bộ lên đỉnh ngắm toàn cảnh Đà Lạt kỳ ảo.",
              tags: ["Trekking", "Núi"],
            },
            {
              name: "Chợ Đêm Đà Lạt",
              rating: "4.4",
              desc: "Thiên đường ẩm thực 5pm–12am: bánh tráng nướng, bánh mì xíu mại, sữa đậu nành.",
              tags: ["Ẩm thực", "Mua sắm"],
            },
          ].map((place) => (
            <article
              key={place.name}
              className="group overflow-hidden rounded-[2rem] border border-pine-500/10 bg-white shadow-[0_16px_42px_rgba(26,47,15,0.06)] transition hover:border-pine-500/25 hover:shadow-[0_24px_60px_rgba(26,47,15,0.12)]"
            >
              <div className="aspect-video bg-gradient-to-br from-pine-500/20 to-mist-300/20" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-2xl text-pine-900">{place.name}</h3>
                  <span className="text-lg font-bold text-pine-900">⭐ {place.rating}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-smoke">{place.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {place.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-pine-500/5 px-2.5 py-1 text-xs font-semibold text-pine-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 7 — 4 MÙA ĐẸP */}
      <section className="mx-auto px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Chu Kỳ Mùa</p>
        <h2 className="mt-4 text-center font-display text-5xl text-pine-900">Bốn mùa, bốn vẻ đẹp</h2>
        <div className="mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🌸",
              month: "Tháng 1–3",
              title: "Hoa Mai Anh Đào",
              desc: "Đường Trần Hưng Đạo và khu Hoa Viên rực hồng",
            },
            {
              icon: "🌧️",
              month: "Tháng 4–6",
              title: "Mưa Nhẹ Thác Đẹp",
              desc: "Thác Datanla, Thác Pongour chảy mạnh nhất",
            },
            {
              icon: "☀️",
              month: "Tháng 7–9",
              title: "Khô Ráo Trekking",
              desc: "Thời tiết tốt nhất để leo núi, cắm trại",
            },
            {
              icon: "🌺",
              month: "Tháng 10–12",
              title: "Dã Quỳ Vàng Rực",
              desc: "Hoa dã quỳ nở vàng khắp đèo Prenn",
            },
          ].map((season) => (
            <article
              key={season.month}
              className="rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)]"
            >
              <p className="text-4xl">{season.icon}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-pine-700">{season.month}</p>
              <h3 className="mt-2 font-heading text-2xl text-pine-900">{season.title}</h3>
              <p className="mt-3 text-sm text-smoke">{season.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 8 — BLOG */}
      <section className="mx-auto px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Góc Nhìn</p>
        <h2 className="mt-4 text-center font-display text-5xl text-pine-900">Góc nhìn của người yêu Đà Lạt</h2>
        <div className="mx-auto mt-12 max-w-7xl grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Hành trình 3 ngày 2 đêm với 2 triệu đồng",
              excerpt:
                "Khám phá Đà Lạt trọn vẹn với ngân sách tiết kiệm nếu biết chọn homestay và ăn đúng chỗ. Đi đâu, ăn gì, chi bao nhiêu?",
            },
            {
              title: "Top 10 quán cà phê view đẹp nhất 2025",
              excerpt:
                "Từ cà phê đỉnh đồi nhìn ra thung lũng đến quán sương mù giữa rừng thông kỳ ảo. Một danh sách để không bỏ sót.",
            },
            {
              title: "Bánh tráng nướng Đà Lạt ăn ở đâu ngon nhất?",
              excerpt:
                "Món ăn đường phố đặc trưng với trứng cút, hành lá và pate thơm lừng. Những quán chính hiệu mà bạn phải thử.",
            },
          ].map((post) => (
            <article
              key={post.title}
              className="group rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_16px_42px_rgba(26,47,15,0.06)] transition hover:shadow-[0_24px_60px_rgba(26,47,15,0.12)]"
            >
              <div className="aspect-video bg-gradient-to-br from-pine-500/10 to-mist-300/10 rounded-[1.5rem]" />
              <h3 className="mt-4 font-heading text-xl text-pine-900">{post.title}</h3>
              <p className="mt-3 text-sm leading-6 text-smoke">{post.excerpt}</p>
              <a
                href="#"
                className="mt-5 inline-flex text-sm font-semibold text-pine-700 transition group-hover:text-pine-900"
              >
                Đọc tiếp →
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

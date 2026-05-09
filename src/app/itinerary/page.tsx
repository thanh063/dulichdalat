"use client";

import { useMemo, useState } from "react";
import { ChatWidget } from "@/components/chat/chat-widget";

const durations = ["1 ngày", "2 ngày", "3 ngày", "4 ngày", "5 ngày+"];
const companions = ["Cặp đôi", "Gia đình", "Nhóm bạn", "Solo"];
const styles = ["Thiên nhiên", "Sống ảo", "Cà phê nghỉ dưỡng", "Ẩm thực", "Văn hoá", "Mạo hiểm"];
const budgets = ["Tiết kiệm <1tr", "Vừa phải 1–3tr", "Thoải mái 3–5tr", "VIP 5tr+"];

export default function ItineraryPage() {
  const [duration, setDuration] = useState(durations[2]);
  const [companion, setCompanion] = useState(companions[0]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([styles[0]]);
  const [budget, setBudget] = useState(budgets[1]);
  const [autoSend, setAutoSend] = useState<string | null>(null);

  const generatedPrompt = useMemo(() => {
    return `Lịch trình ${duration} cho ${companion.toLowerCase()}, phong cách ${selectedStyles.join(", ")}, ngân sách ${budget}. Hãy đề xuất thời gian, địa điểm và chi phí ước tính.`;
  }, [budget, companion, duration, selectedStyles]);

  function toggleStyle(style: string) {
    setSelectedStyles((current) =>
      current.includes(style) ? current.filter((item) => item !== style) : [...current, style],
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-pine-500/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Lịch trình cá nhân hoá với AI</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">30 giây để có kế hoạch đi Đà Lạt thật hợp ý</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-smoke">Chọn các tuỳ chọn bên dưới, tôi sẽ ghép chúng thành câu hỏi rõ ràng và đẩy trực tiếp vào khung chat AI ở cuối trang.</p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <StepCard title="Bước 1 — Thời gian">
            <OptionGroup options={durations} value={duration} onChange={setDuration} />
          </StepCard>
          <StepCard title="Bước 2 — Đi với ai">
            <OptionGroup options={companions} value={companion} onChange={setCompanion} />
          </StepCard>
          <StepCard title="Bước 3 — Phong cách">
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedStyles.includes(style)
                      ? "bg-pine-700 text-cream"
                      : "border border-pine-500/15 bg-white text-charcoal hover:bg-pine-500/5"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </StepCard>
          <StepCard title="Bước 4 — Ngân sách">
            <OptionGroup options={budgets} value={budget} onChange={setBudget} />
          </StepCard>
          <button
            type="button"
            onClick={() => setAutoSend(generatedPrompt)}
            className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
          >
            ✨ Tạo lịch trình ngay
          </button>
        </div>

        <div className="rounded-[2rem] border border-pine-500/10 bg-cream p-4 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <ChatWidget mode="embedded" autoSend={autoSend} />
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-pine-500/10 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Câu hỏi đã tạo</p>
        <p className="mt-3 text-sm leading-7 text-smoke">{generatedPrompt}</p>
      </section>
    </div>
  );
}

function StepCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[2rem] border border-pine-500/10 bg-white p-5 shadow-[0_16px_42px_rgba(26,47,15,0.06)]">
      <h2 className="mb-4 font-heading text-3xl text-pine-900">{title}</h2>
      {children}
    </article>
  );
}

function OptionGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === option
              ? "bg-pine-700 text-cream"
              : "border border-pine-500/15 bg-white text-charcoal hover:bg-pine-500/5"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
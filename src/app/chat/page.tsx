"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";

const suggestionGroups = [
  {
    title: "Lên lịch trình",
    items: [
      "Lịch trình 3 ngày 2 đêm cho cặp đôi",
      "Đi một mình 4 ngày, thích thiên nhiên",
      "Gia đình 4 người, 2 ngày cuối tuần",
      "Budget 1.5 triệu đồng, đi 2 ngày",
    ],
  },
  {
    title: "Tìm địa điểm",
    items: [
      "Quán cà phê view đẹp nhất Đà Lạt",
      "Ăn sáng ở đâu ngon gần trung tâm?",
      "Góc chụp ảnh đẹp nhất hiện tại",
      "Mùa hoa gì đang nở?",
    ],
  },
  {
    title: "Đặt chỗ",
    items: [
      "Homestay giá dưới 300k/đêm",
      "Đặt bàn nhà hàng lẩu bò Đà Lạt",
    ],
  },
] as const;

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";
  const [autoSend, setAutoSend] = useState<string | null>(initialPrompt || null);

  const quickSuggestions = useMemo(
    () => suggestionGroups.flatMap((group) => group.items),
    [],
  );

  return (
    <div className="mx-auto grid h-[calc(100vh-7rem)] max-w-7xl gap-6 px-6 py-6 sm:px-10 lg:grid-cols-[0.34fr_0.66fr] lg:px-12">
      <aside className="hidden rounded-[2rem] border border-pine-500/10 bg-white p-6 shadow-[0_20px_60px_rgba(26,47,15,0.08)] lg:block">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-700 text-2xl text-cream">🌿</div>
          <div>
            <p className="font-heading text-3xl text-pine-900">Xin chào!</p>
            <p className="text-sm text-smoke">Tôi là trợ lý du lịch Đà Lạt.</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {suggestionGroups.map((group) => (
            <section key={group.title}>
              <h2 className="font-heading text-2xl text-pine-900">{group.title}</h2>
              <div className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAutoSend(item)}
                    className="block w-full rounded-2xl border border-pine-500/10 bg-cream px-4 py-3 text-left text-sm text-charcoal transition hover:border-pine-500/25 hover:bg-pine-500/5"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-pine-500/10 bg-cream p-3 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <div className="mb-3 rounded-[1.75rem] bg-white p-4 text-sm text-smoke lg:hidden">
          Gợi ý nhanh: {quickSuggestions[0]} · {quickSuggestions[1]} · {quickSuggestions[2]}
        </div>
        <ChatWidget mode="embedded" autoSend={autoSend} />
      </section>
    </div>
  );
}
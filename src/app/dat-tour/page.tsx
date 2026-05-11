"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ItineraryDay = {
  date: string;
  places: string[];
};

type ItineraryState = {
  startDate: string;
  durationDays: number;
  days: ItineraryDay[];
  loading: boolean;
  error?: string;
  title: string;
};

export default function DatTourPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryState>({
    startDate: new Date().toISOString().split("T")[0],
    durationDays: 3,
    days: [],
    loading: false,
    title: "",
  });
  const [shareLink, setShareLink] = useState("");
  const [draggedPlace, setDraggedPlace] = useState<{ place: string; dayIndex: number } | null>(null);

  // Load user info
  useEffect(() => {
    const stored = window.localStorage.getItem("dalat_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  // Generate initial itinerary when step changes to 2
  useEffect(() => {
    if (currentStep === 2 && itinerary.days.length === 0) {
      void generateItinerary();
    }
  }, [currentStep, generateItinerary, itinerary.days.length]);

  const suggestedPlaces = useMemo(
    () => [
      "Thác Datanla",
      "Đồi Thông Hồ",
      "Nhà thờ Con Gà",
      "Hồ Xuân Hương",
      "Vườn hoa Thành phố",
      "Ga Đà Lạt",
      "Phố cổ Lâm Đồng",
      "Thiền viện Trúc Lâm",
      "Thác Liên Khương",
      "Langbiang Palace",
      "Vườn Đơi",
      "Chợ Đà Lạt",
      "Hàng Cót",
      "Hồ Tuyền Lâm",
      "Tiên Cảnh",
    ],
    [],
  );

  const generateItinerary = useCallback(async () => {
    setItinerary((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const response = await fetch("/api/itineraries/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: itinerary.startDate,
          durationDays: itinerary.durationDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể tạo lịch trình");
      }

      const data = (await response.json()) as { days?: ItineraryDay[] };
      const days = data.days || Array.from({ length: itinerary.durationDays }, (_, i) => ({
        date: new Date(new Date(itinerary.startDate).getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        places: suggestedPlaces.slice(i * 3, i * 3 + 3),
      }));

      setItinerary((prev) => ({
        ...prev,
        days,
        loading: false,
      }));
    } catch (err) {
      setItinerary((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      }));
    }
  }, [itinerary.startDate, itinerary.durationDays, suggestedPlaces]);

  async function saveItinerary() {
    if (!user) {
      router.push("/login");
      return;
    }

    const title = itinerary.title || `Tour ${itinerary.durationDays} ngày từ ${itinerary.startDate}`;

    try {
      const response = await fetch("/api/itineraries/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startDate: itinerary.startDate,
          durationDays: itinerary.durationDays,
          days: itinerary.days,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể lưu lịch trình");
      }

      const data = (await response.json()) as { shareToken?: string; id?: number };
      setShareLink(`${window.location.origin}/dat-tour/${data.shareToken}`);
      setCurrentStep(3);
    } catch (err) {
      setItinerary((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Lỗi không xác định",
      }));
    }
  }

  function addPlaceToDay(dayIndex: number, place: string) {
    setItinerary((prev) => {
      const updatedDays = [...prev.days];
      if (!updatedDays[dayIndex].places.includes(place)) {
        updatedDays[dayIndex].places.push(place);
      }
      return { ...prev, days: updatedDays };
    });
  }

  function removePlaceFromDay(dayIndex: number, placeIndex: number) {
    setItinerary((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[dayIndex].places.splice(placeIndex, 1);
      return { ...prev, days: updatedDays };
    });
  }

  function movePlaceUp(dayIndex: number, placeIndex: number) {
    if (placeIndex === 0) return;
    setItinerary((prev) => {
      const updatedDays = [...prev.days];
      const temp = updatedDays[dayIndex].places[placeIndex - 1];
      updatedDays[dayIndex].places[placeIndex - 1] = updatedDays[dayIndex].places[placeIndex];
      updatedDays[dayIndex].places[placeIndex] = temp;
      return { ...prev, days: updatedDays };
    });
  }

  function movePlaceDown(dayIndex: number, placeIndex: number) {
    if (placeIndex === itinerary.days[dayIndex]?.places.length - 1) return;
    setItinerary((prev) => {
      const updatedDays = [...prev.days];
      const temp = updatedDays[dayIndex].places[placeIndex + 1];
      updatedDays[dayIndex].places[placeIndex + 1] = updatedDays[dayIndex].places[placeIndex];
      updatedDays[dayIndex].places[placeIndex] = temp;
      return { ...prev, days: updatedDays };
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
      {/* Header */}
      <section className="rounded-[2rem] border border-pine-500/10 bg-white/80 p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pine-700">Đặt Tour Đà Lạt</p>
        <h1 className="mt-4 font-display text-5xl text-pine-900">Tạo Lịch Trình Du Lịch Hoàn Hảo</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-smoke">
          Chọn ngày đi, để AI tạo gợi ý lịch trình, sau đó tuỳ chỉnh theo ý của bạn.
        </p>
      </section>

      {/* Stepper */}
      <div className="mt-10 flex items-center justify-center gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(step)}
              disabled={step > 2 && currentStep < 3}
              className={`h-10 w-10 rounded-full text-sm font-bold transition ${
                currentStep >= step
                  ? "bg-pine-700 text-cream"
                  : "border-2 border-pine-500/20 text-charcoal"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {step}
            </button>
            {step < 3 && <div className="h-1 w-12 bg-pine-500/20" />}
          </div>
        ))}
      </div>

      {/* Step 1: Choose Date & Duration */}
      {currentStep === 1 && (
        <section className="mt-10 rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <h2 className="font-heading text-3xl text-pine-900">Bước 1: Chọn Ngày & Số Ngày</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-charcoal">Ngày khởi hành</label>
              <input
                type="date"
                value={itinerary.startDate}
                onChange={(e) =>
                  setItinerary((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal">Số ngày</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() =>
                      setItinerary((prev) => ({
                        ...prev,
                        durationDays: days,
                        days: [],
                      }))
                    }
                    className={`rounded-lg px-4 py-2 font-semibold transition ${
                      itinerary.durationDays === days
                        ? "bg-pine-700 text-cream"
                        : "border-2 border-pine-500/20 text-charcoal hover:bg-pine-500/5"
                    }`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
            >
              Tiếp Tục →
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Edit Itinerary */}
      {currentStep === 2 && (
        <section className="mt-10 rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <h2 className="font-heading text-3xl text-pine-900">Bước 2: Tạo & Tuỳ Chỉnh Lịch Trình</h2>

          {itinerary.loading && (
            <div className="mt-6 text-center">
              <p className="text-smoke">Đang tạo lịch trình...</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pine-500 animate-pulse" />
                <span className="h-2 w-2 rounded-full bg-pine-500 animate-pulse [animation-delay:0.15s]" />
                <span className="h-2 w-2 rounded-full bg-pine-500 animate-pulse [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          {itinerary.error && (
            <div className="mt-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
              {itinerary.error}
            </div>
          )}

          {!itinerary.loading && itinerary.days.length > 0 && (
            <>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Suggested Places */}
                <div className="rounded-lg border border-pine-500/10 bg-stone-50 p-4">
                  <h3 className="font-semibold text-charcoal">Địa Điểm Đề Xuất</h3>
                  <div className="mt-4 space-y-2">
                    {suggestedPlaces.map((place) => (
                      <button
                        key={place}
                        type="button"
                        draggable
                        onDragStart={() =>
                          setDraggedPlace({
                            place,
                            dayIndex: -1,
                          })
                        }
                        onDragEnd={() => setDraggedPlace(null)}
                        className="w-full rounded-lg border border-pine-500/20 bg-white px-3 py-2 text-left text-sm font-semibold text-charcoal transition hover:bg-pine-500/5 cursor-move"
                      >
                        🏷️ {place}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days */}
                <div className="lg:col-span-2 space-y-4">
                  {itinerary.days.map((day, dayIndex) => (
                    <div
                      key={day.date}
                      onDrop={() => {
                        if (draggedPlace) {
                          addPlaceToDay(dayIndex, draggedPlace.place);
                          setDraggedPlace(null);
                        }
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="rounded-lg border-2 border-dashed border-pine-500/20 bg-cream p-4 hover:border-pine-500/40 transition"
                    >
                      <h3 className="font-semibold text-charcoal">
                        Ngày {dayIndex + 1} — {new Date(day.date).toLocaleDateString("vi-VN")}
                      </h3>
                      <div className="mt-3 space-y-2">
                        {day.places.length === 0 ? (
                          <p className="text-sm text-smoke italic">Kéo thả địa điểm vào đây</p>
                        ) : (
                          day.places.map((place, placeIndex) => (
                            <div
                              key={`${dayIndex}-${placeIndex}`}
                              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                            >
                              <span className="font-semibold text-charcoal">{place}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => movePlaceUp(dayIndex, placeIndex)}
                                  className="px-2 py-1 text-xs font-semibold text-pine-700 hover:bg-pine-500/10 rounded transition disabled:opacity-50"
                                  disabled={placeIndex === 0}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePlaceDown(dayIndex, placeIndex)}
                                  className="px-2 py-1 text-xs font-semibold text-pine-700 hover:bg-pine-500/10 rounded transition disabled:opacity-50"
                                  disabled={placeIndex === day.places.length - 1}
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePlaceFromDay(dayIndex, placeIndex)}
                                  className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 rounded transition"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="rounded-full border-2 border-pine-500/20 px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-pine-500/5"
                >
                  ← Quay Lại
                </button>
                <button
                  type="button"
                  onClick={() => generateItinerary()}
                  className="rounded-full border-2 border-pine-700 px-6 py-3 text-sm font-semibold text-pine-700 transition hover:bg-pine-700/10"
                >
                  ↻ Tạo Lại
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
                >
                  Tiếp Tục →
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Step 3: Review & Save */}
      {currentStep === 3 && (
        <section className="mt-10 rounded-[2rem] border border-pine-500/10 bg-white p-8 shadow-[0_20px_60px_rgba(26,47,15,0.08)]">
          <h2 className="font-heading text-3xl text-pine-900">Bước 3: Tổng Quan & Lưu</h2>

          {!shareLink ? (
            <>
              <div className="mt-8">
                <label className="block text-sm font-semibold text-charcoal">Tên lịch trình (tuỳ chọn)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nghỉ lễ Đà Lạt 2024"
                  value={itinerary.title}
                  onChange={(e) =>
                    setItinerary((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-lg border-2 border-pine-500/20 px-4 py-2 outline-none transition focus:border-pine-500"
                />
              </div>

              <div className="mt-8 space-y-4">
                {itinerary.days.map((day, dayIndex) => (
                  <div key={day.date} className="rounded-lg border border-pine-500/10 bg-stone-50 p-4">
                    <h3 className="font-semibold text-charcoal">
                      Ngày {dayIndex + 1} — {new Date(day.date).toLocaleDateString("vi-VN")}
                    </h3>
                    <div className="mt-2 space-y-1">
                      {day.places.map((place, placeIndex) => (
                        <p key={`${dayIndex}-${placeIndex}`} className="text-sm text-smoke">
                          {placeIndex + 1}. {place}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {itinerary.error && (
                <div className="mt-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                  {itinerary.error}
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="rounded-full border-2 border-pine-500/20 px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-pine-500/5"
                >
                  ← Quay Lại
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={() => saveItinerary()}
                    className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
                  >
                    💾 Lưu Lịch Trình
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
                  >
                    🔐 Đăng Nhập để Lưu
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-lg border border-green-500/30 bg-green-50 p-6">
              <p className="text-sm font-semibold text-green-700">✓ Lịch trình đã được lưu thành công!</p>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-charcoal">Link chia sẻ</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 rounded-lg border-2 border-pine-500/20 px-4 py-2 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      alert("Đã sao chép link!");
                    }}
                    className="rounded-lg bg-pine-700 px-4 py-2 text-sm font-semibold text-cream transition hover:bg-pine-900"
                  >
                    📋 Sao Chép
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/dat-tour");
                  }}
                  className="rounded-full border-2 border-pine-500/20 px-6 py-3 text-sm font-semibold text-charcoal transition hover:bg-pine-500/5"
                >
                  Tạo Lịch Trình Mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.share?.({
                      title: "Lịch trình Đà Lạt",
                      text: "Xem lịch trình du lịch Đà Lạt của tôi",
                      url: shareLink,
                    });
                  }}
                  className="rounded-full bg-pine-700 px-6 py-3 text-sm font-semibold text-cream transition hover:bg-pine-900"
                >
                  📤 Chia Sẻ
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

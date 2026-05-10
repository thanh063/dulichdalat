"use client";

import { useState } from "react";

type BookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeName: string;
  bookingType: "room" | "table";
  onBooked?: (message: string) => void;
};

export function BookingModal({ open, onOpenChange, placeName, bookingType, onBooked }: BookingModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateIn, setDateIn] = useState("");
  const [dateOut, setDateOut] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!open) {
    return null;
  }

  async function submitBooking() {
    setStatus("idle");
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_name: placeName,
          type: bookingType,
          customer_name: customerName,
          phone,
          date_in: dateIn,
          date_out: dateOut || null,
          time: time || null,
          guests,
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Không thể tạo đặt chỗ");
      }

      setStatus("success");
      const successMessage = data.message || `Đặt chỗ ${placeName} thành công.`;
      setMessage(successMessage);
      onBooked?.(successMessage);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Có lỗi khi gửi yêu cầu đặt chỗ.");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] bg-cream p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-3xl text-pine-900">Đặt chỗ</h3>
          <button type="button" onClick={() => onOpenChange(false)} className="text-sm text-smoke">
            Đóng
          </button>
        </div>
        <p className="mb-4 text-sm text-smoke">
          {bookingType === "room" ? "Đặt phòng" : "Đặt bàn"} tại <strong>{placeName}</strong>.
        </p>
        <div className="grid gap-3">
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Họ và tên" className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={dateIn} onChange={(event) => setDateIn(event.target.value)} type="date" className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
            <input value={dateOut} onChange={(event) => setDateOut(event.target.value)} type="date" className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={time} onChange={(event) => setTime(event.target.value)} type="time" className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
            <input value={String(guests)} onChange={(event) => setGuests(Number(event.target.value) || 1)} type="number" min={1} className="h-12 rounded-2xl border border-pine-500/15 bg-white px-4 text-sm outline-none" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void submitBooking()}
          className="rounded-full bg-pine-700 px-5 py-3 text-sm font-semibold text-cream"
        >
          Gửi yêu cầu
        </button>
        {message ? (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${status === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
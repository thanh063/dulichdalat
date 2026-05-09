"use client";

import { useState } from "react";

type BookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!open) {
    return null;
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
          Giao diện này sẽ kết nối API đặt bàn hoặc đặt phòng khi bạn kích hoạt.
        </p>
        <button
          type="button"
          onClick={() => setStatus("success")}
          className="rounded-full bg-pine-700 px-5 py-3 text-sm font-semibold text-cream"
        >
          Mô phỏng gửi yêu cầu
        </button>
        {status === "success" ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Đặt chỗ thành công.
          </p>
        ) : null}
      </div>
    </div>
  );
}
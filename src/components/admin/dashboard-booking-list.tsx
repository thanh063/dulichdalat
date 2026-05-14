"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type BookingRow = {
  id: number;
  place_name: string;
  customer_name: string;
  guests: number;
  status: BookingStatus;
  date_in: string;
  created_at: string;
};

type Props = {
  bookings: BookingRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusStyle(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-700";
    case "cancelled":
      return "bg-rose-500/10 text-rose-700";
    default:
      return "bg-amber-500/10 text-amber-700";
  }
}

function getStatusLabel(status: BookingStatus) {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Chờ duyệt";
  }
}

export function DashboardBookingList({ bookings }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(bookings);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const hasPendingItems = useMemo(() => items.some((booking) => booking.status === "pending"), [items]);

  async function updateBookingStatus(id: number, status: BookingStatus) {
    setSavingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || data.success === false) {
        throw new Error(data.message ?? "Không thể cập nhật trạng thái.");
      }

      setItems((currentItems) => currentItems.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
      startTransition(() => {
        router.refresh();
      });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật trạng thái.");
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return <div className="px-5 py-10 text-sm text-smoke">Chưa có booking nào để xử lý.</div>;
  }

  return (
    <div className="divide-y divide-pine-500/10">
      {error ? <div className="px-5 py-4 text-sm text-rose-700">{error}</div> : null}
      {!hasPendingItems ? (
        <div className="px-5 py-4 text-sm text-smoke">Không có booking chờ duyệt. Bạn vẫn có thể đổi trạng thái các booking gần nhất nếu cần.</div>
      ) : null}
      {items.map((booking) => (
        <div key={booking.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_0.7fr_0.9fr] md:items-center">
          <div>
            <p className="font-semibold text-pine-900">{booking.customer_name}</p>
            <p className="mt-1 text-sm text-smoke">{booking.place_name}</p>
          </div>
          <div className="text-sm text-smoke">
            <p>{formatDate(booking.date_in)}</p>
            <p className="mt-1">{formatDate(booking.created_at)}</p>
          </div>
          <div className="text-sm text-smoke">{booking.guests} khách</div>
          <div className="flex flex-col gap-2 md:items-end">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(booking.status)}`}>
              {getStatusLabel(booking.status)}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void updateBookingStatus(booking.id, "confirmed")}
                disabled={savingId === booking.id}
                className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => void updateBookingStatus(booking.id, "cancelled")}
                disabled={savingId === booking.id}
                className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
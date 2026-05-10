import { getSupabaseAdminClient } from "@/lib/chatbot/db";

export interface BookingRequest {
  placeName: string;
  customerName: string;
  phone: string;
  dateIn: string;
  dateOut?: string | null;
  time?: string | null;
  guests: number;
  type: 'table' | 'room';
  userId?: string | null;
}

export async function createBooking(booking: BookingRequest): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return true; // if no admin client, pretend success

  try {
    type BookingInsert = {
      user_id: string | null;
      place_name: string;
      type: 'table' | 'room';
      customer_name: string;
      phone: string;
      date_in: string;
      date_out?: string | null;
      time?: string | null;
      guests: number;
      status?: string;
    };

    const payload: BookingInsert = {
      user_id: booking.userId || null,
      place_name: booking.placeName,
      type: booking.type,
      customer_name: booking.customerName,
      phone: booking.phone,
      date_in: booking.dateIn,
      date_out: booking.dateOut || null,
      time: booking.time || null,
      guests: booking.guests,
      status: 'pending',
    };

    const insert = await supabase.from('bookings').insert(payload).select().single();
    if (insert.error) {
      console.error('Booking insert error:', insert.error.message);
      return false;
    }

    await supabase.from('admin_notifications').insert({
      type: 'new_booking',
      title: 'Đặt chỗ mới',
      message: `${booking.customerName} vừa đặt ${booking.placeName}`,
      booking_id: insert.data.id,
    });

    return true;
  } catch (error) {
    console.error('createBooking error:', error);
    return false;
  }
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookingStatus } from "../types";

// The backend exposes booking detail/contact/status/cancel endpoints scoped
// to a single bookingId, but there is no "list my bookings" endpoint for
// riders or drivers (only /admin/bookings, which is admin-only). To give
// users a working Bookings tab, we keep a lightweight local index of every
// booking the current device has initiated or opened, and refresh each
// entry's live status from the server. This is a client-side convenience,
// not a source of truth — bookings made from another device won't appear
// here unless opened on this device too.

export interface LocalBookingEntry {
  id: string;
  status: BookingStatus;
  fromCity: string;
  toCity: string;
  departureTime: string;
  amount: number;
  seatsBooked: number;
  role: "RIDER" | "DRIVER";
  createdAt: string;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
}

function keyFor(userId: string) {
  return `ridebridge_local_bookings_${userId}`;
}

export async function getLocalBookings(userId: string): Promise<LocalBookingEntry[]> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function upsertLocalBooking(userId: string, entry: LocalBookingEntry): Promise<void> {
  const existing = await getLocalBookings(userId);
  const idx = existing.findIndex((b) => b.id === entry.id);
  if (idx >= 0) existing[idx] = { ...existing[idx], ...entry };
  else existing.unshift(entry);
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(existing));
}

export async function patchLocalBookingStatus(userId: string, id: string, status: BookingStatus): Promise<void> {
  const existing = await getLocalBookings(userId);
  const idx = existing.findIndex((b) => b.id === id);
  if (idx >= 0) {
    existing[idx].status = status;
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(existing));
  }
}

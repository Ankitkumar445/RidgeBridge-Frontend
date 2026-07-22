import { api } from "./client";
import { BookingContact, BookingInitiateResult, BookingStatus, MyBooking } from "../types";

export const bookingsApi = {
  mine: () => api.get<MyBooking[]>("/bookings/mine").then((r) => r.data),

  initiate: (listingId: string, seatsBooked: number) =>
    api.post<BookingInitiateResult>("/bookings", { listingId, seatsBooked }).then((r) => r.data),

  confirmPayment: (
    bookingId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) =>
    api
      .post<{ id: string; status: BookingStatus }>("/bookings/confirm-payment", {
        bookingId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      })
      .then((r) => r.data),

  getContact: (bookingId: string) =>
    api.get<BookingContact>(`/bookings/${bookingId}/contact`).then((r) => r.data),

  start: (bookingId: string, otp: string) =>
    api.post<{ id: string; status: BookingStatus }>(`/bookings/${bookingId}/start`, { otp }).then((r) => r.data),

  pingLocation: (bookingId: string, lat: number, lng: number) =>
    api.post(`/bookings/${bookingId}/location`, { lat, lng }).then((r) => r.data),

  getLocation: (bookingId: string) =>
    api
      .get<{
        driverLat: number | null;
        driverLng: number | null;
        locationUpdatedAt: string | null;
        destination: { lat: number | null; lng: number | null };
      }>(`/bookings/${bookingId}/location`)
      .then((r) => r.data),

  confirmArrival: (bookingId: string) =>
    api.post<{ id: string; status: BookingStatus }>(`/bookings/${bookingId}/confirm-arrival`).then((r) => r.data),

  cancel: (bookingId: string) =>
    api.post<{ id: string; status: BookingStatus }>(`/bookings/${bookingId}/cancel`).then((r) => r.data),

  raiseDispute: (bookingId: string, reason: string) =>
    api.post(`/admin/bookings/${bookingId}/dispute`, { reason }).then((r) => r.data),
};

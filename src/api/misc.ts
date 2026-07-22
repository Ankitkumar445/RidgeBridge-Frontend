import { api } from "./client";
import { AdminBooking, FullUserProfile, Rating, Role } from "../types";

export const ratingsApi = {
  submit: (bookingId: string, score: number, comment?: string) =>
    api.post<Rating>("/ratings", { bookingId, score, comment: comment || undefined }).then((r) => r.data),

  forUser: (userId: string) => api.get<Rating[]>(`/ratings/user/${userId}`).then((r) => r.data),
};

export const verificationApi = {
  setDob: (dateOfBirth: string) =>
    api
      .post<{ age: number; minAgeForDriver: number; canBeDriver: boolean }>("/verification/date-of-birth", {
        dateOfBirth,
      })
      .then((r) => r.data),

  initiate: (requestedRole: Role) =>
    api
      .post<{ redirectUrl: string; requestId: string; needsDrivingLicence: boolean }>(
        "/verification/digilocker/initiate",
        { requestedRole }
      )
      .then((r) => r.data),

  status: () => api.get<FullUserProfile>("/verification/status").then((r) => r.data),
};

export const adminApi = {
  listBookings: (status?: string) =>
    api.get<AdminBooking[]>("/admin/bookings", { params: status ? { status } : undefined }).then((r) => r.data),

  listDisputes: () => api.get<AdminBooking[]>("/admin/disputes").then((r) => r.data),

  resolveDispute: (bookingId: string, resolution: "REFUND_RIDER" | "RELEASE_DRIVER", notes: string) =>
    api.post<AdminBooking>(`/admin/disputes/${bookingId}/resolve`, { resolution, notes }).then((r) => r.data),
};

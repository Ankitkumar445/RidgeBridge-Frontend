import { api } from "./client";
import { Listing, VehicleType } from "../types";

export interface SearchParams {
  fromCity?: string;
  toCity?: string;
  minPrice?: number;
  maxPrice?: number;
  vehicleType?: VehicleType;
}

export interface CreateListingInput {
  fromCity: string;
  toCity: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  departureTime: string; // ISO
  vehicleType: VehicleType;
  seatsTotal: number;
  pricePerSeat: number;
}

export const listingsApi = {
  search: (params: SearchParams) =>
    api.get<Listing[]>("/listings", { params }).then((r) => r.data),

  create: (data: CreateListingInput) => api.post<Listing>("/listings", data).then((r) => r.data),

  cancel: (listingId: string) =>
    api.post<{ id: string; status: string }>(`/listings/${listingId}/cancel`).then((r) => r.data),
};

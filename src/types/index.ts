export type Role = "RIDER" | "DRIVER" | "BOTH" | "ADMIN";
export type VehicleType = "HATCHBACK" | "SEDAN" | "SUV" | "BIKE";
export type ListingStatus = "ACTIVE" | "FULL" | "CANCELLED" | "COMPLETED";
export type BookingStatus =
  | "PENDING_PAYMENT"
  | "PAID_HELD"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED_BY_RIDER"
  | "CANCELLED_BY_DRIVER"
  | "DISPUTED";
export type KycStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
}

export interface FullUserProfile {
  role: Role;
  aadhaarKycStatus: KycStatus;
  drivingLicenceKycStatus: KycStatus;
  fullyVerifiedAsDriver: boolean;
  fullyVerifiedAsRider: boolean;
}

export interface Listing {
  id: string;
  fromCity: string;
  toCity: string;
  fromLat?: number | null;
  fromLng?: number | null;
  toLat?: number | null;
  toLng?: number | null;
  departureTime: string;
  vehicleType: VehicleType;
  seatsAvailable?: number;
  seatsTotal?: number;
  pricePerSeat: number;
  status?: ListingStatus;
  driver?: { id: string; name: string; rating: number; isVerified: boolean };
}

export interface BookingInitiateResult {
  booking: { id: string; amount: number; status: BookingStatus };
  razorpayOrderId: string;
  amount: number;
  keyId: string;
}

export interface BookingContact {
  bookingId: string;
  status: BookingStatus;
  driverContact: string;
  riderContact: string;
  otpCode: string | null;
  route: { fromLat: number | null; fromLng: number | null; toLat: number | null; toLng: number | null };
}

export interface AdminBooking {
  id: string;
  status: BookingStatus;
  amount: number;
  driverPayoutAmount: number;
  platformFee: number;
  seatsBooked: number;
  createdAt: string;
  disputeReason?: string | null;
  disputeNotes?: string | null;
  listing: { fromCity: string; toCity: string; departureTime: string; driver: { id: string; name: string; phone: string } };
  rider: { id: string; name: string; phone: string };
  payment?: { status: string; amount: number } | null;
}

export interface Rating {
  id: string;
  score: number;
  comment?: string | null;
  createdAt: string;
  fromUser?: { name: string };
}

export interface MyBooking {
  id: string;
  status: BookingStatus;
  amount: number;
  seatsBooked: number;
  createdAt: string;
  role: "RIDER" | "DRIVER";
  listing: {
    fromCity: string;
    toCity: string;
    departureTime: string;
    vehicleType: VehicleType;
    driver: { id: string; name: string; phone: string; rating: number; isVerified: boolean };
  };
  rider: { id: string; name: string; phone: string; rating: number };
}

export interface ApiErrorShape {
  error: string;
}

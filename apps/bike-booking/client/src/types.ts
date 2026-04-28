export interface Bike {
  id: string;
  name: string;
  type: "mountain" | "road" | "city" | "electric";
  description: string;
  pricePerHour: number;
  imageUrl: string;
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  bikeId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  bike?: Bike | null;
  totalPrice?: number;
}

export interface CreateBookingRequest {
  bikeId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type View =
  | "bikes"
  | "bike-detail"
  | "my-bookings"
  | "booking-success"
  | "login"
  | "register";

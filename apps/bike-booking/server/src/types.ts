export interface Bike {
  id: string;
  name: string;
  type: "mountain" | "road" | "city" | "electric";
  description: string;
  pricePerHour: number;
  imageUrl: string;
}

export interface Booking {
  id: string;
  bikeId: string;
  userId: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export interface CreateBookingRequest {
  bikeId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

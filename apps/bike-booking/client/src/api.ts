import type {
  ApiResponse,
  Bike,
  Booking,
  CreateBookingRequest,
  User,
  RegisterRequest,
  LoginRequest,
} from "./types";

const API_BASE = "/api";

// Bikes API
export async function getBikes(type?: string): Promise<Bike[]> {
  const params = type ? `?type=${type}` : "";
  const response = await fetch(`${API_BASE}/bikes${params}`);
  const data: ApiResponse<Bike[]> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch bikes");
  }
  return data.data || [];
}

export async function getBike(
  id: string,
): Promise<Bike & { bookings: Booking[] }> {
  const response = await fetch(`${API_BASE}/bikes/${id}`);
  const data: ApiResponse<Bike & { bookings: Booking[] }> =
    await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch bike");
  }
  return data.data!;
}

export async function checkAvailability(
  bikeId: string,
  startTime: string,
  endTime: string,
): Promise<boolean> {
  const params = new URLSearchParams({ startTime, endTime });
  const response = await fetch(
    `${API_BASE}/bikes/${bikeId}/availability?${params}`,
  );
  const data: ApiResponse<{ available: boolean }> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to check availability");
  }
  return data.data?.available || false;
}

// Bookings API
export async function getBookings(userId?: string): Promise<Booking[]> {
  const params = userId ? `?userId=${userId}` : "";
  const response = await fetch(`${API_BASE}/bookings${params}`);
  const data: ApiResponse<Booking[]> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch bookings");
  }
  return data.data || [];
}

export async function createBooking(
  booking: CreateBookingRequest,
): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  const data: ApiResponse<Booking> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to create booking");
  }
  return data.data!;
}

export async function cancelBooking(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
  });
  const data: ApiResponse<{ message: string }> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to cancel booking");
  }
}

// Users API
export async function register(request: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data: ApiResponse<User> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to register");
  }
  return data.data!;
}

export async function login(request: LoginRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data: ApiResponse<User> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to login");
  }
  return data.data!;
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`);
  const data: ApiResponse<User> = await response.json();
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch user");
  }
  return data.data!;
}

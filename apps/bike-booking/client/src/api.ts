import { ApiResponse, Bike, Booking, CreateBookingRequest } from "./types";

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

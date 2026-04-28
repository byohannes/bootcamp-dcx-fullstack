import { Bike, Booking, User } from "./types";

// Sample bikes data
export const bikes: Bike[] = [
  {
    id: "bike-1",
    name: "Mountain Explorer",
    type: "mountain",
    description: "Perfect for trail adventures and rough terrain",
    pricePerHour: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&h=300&fit=crop",
  },
  {
    id: "bike-2",
    name: "City Cruiser",
    type: "city",
    description: "Comfortable ride for urban commuting",
    pricePerHour: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=300&fit=crop",
  },
  {
    id: "bike-3",
    name: "Speed Racer",
    type: "road",
    description: "Lightweight and fast for road cycling",
    pricePerHour: 20,
    imageUrl:
      "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=300&fit=crop",
  },
  {
    id: "bike-4",
    name: "Eco Electric",
    type: "electric",
    description: "Electric assist for effortless riding",
    pricePerHour: 25,
    imageUrl:
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
  },
  {
    id: "bike-5",
    name: "Trail Blazer",
    type: "mountain",
    description: "Heavy-duty mountain bike for extreme trails",
    pricePerHour: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop",
  },
  {
    id: "bike-6",
    name: "Urban Commuter",
    type: "city",
    description: "Practical city bike with basket and lights",
    pricePerHour: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
];

// Bookings storage (in-memory)
export const bookings: Booking[] = [];

// Users storage (in-memory)
export const users: User[] = [];

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if a bike is available for the given time period
export function isBikeAvailable(
  bikeId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
): boolean {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  return !bookings.some((booking) => {
    if (booking.bikeId !== bikeId) return false;
    if (booking.status === "cancelled") return false;
    if (excludeBookingId && booking.id === excludeBookingId) return false;

    const bookingStart = new Date(booking.startTime).getTime();
    const bookingEnd = new Date(booking.endTime).getTime();

    // Check for overlap
    return start < bookingEnd && end > bookingStart;
  });
}

// Get all bookings for a specific bike
export function getBikeBookings(bikeId: string): Booking[] {
  return bookings.filter(
    (b) => b.bikeId === bikeId && b.status === "confirmed",
  );
}

// Get all bookings for a specific user
export function getUserBookings(userId: string): Booking[] {
  return bookings.filter((b) => b.userId === userId);
}

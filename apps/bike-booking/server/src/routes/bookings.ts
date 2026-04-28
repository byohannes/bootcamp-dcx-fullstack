import { Router, Request, Response } from "express";
import {
  bookings,
  bikes,
  generateId,
  isBikeAvailable,
  getUserBookings,
} from "../data";
import { ApiResponse, Bike, Booking, CreateBookingRequest } from "../types";

const router = Router();

// GET /api/bookings - List all bookings (optionally filter by userId)
router.get("/", (req: Request, res: Response) => {
  const { userId } = req.query;

  let filteredBookings = bookings;

  if (userId && typeof userId === "string") {
    filteredBookings = getUserBookings(userId);
  }

  // Enrich bookings with bike info
  const enrichedBookings = filteredBookings.map((booking) => {
    const bike = bikes.find((b) => b.id === booking.bikeId);
    return {
      ...booking,
      bike: bike || null,
    };
  });

  const response: ApiResponse<typeof enrichedBookings> = {
    success: true,
    data: enrichedBookings,
  };
  res.json(response);
});

// GET /api/bookings/:id - Get single booking
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Booking not found",
    };
    res.status(404).json(response);
    return;
  }

  const bike = bikes.find((b) => b.id === booking.bikeId);

  const response: ApiResponse<Booking & { bike: Bike | null }> = {
    success: true,
    data: {
      ...booking,
      bike: bike || null,
    },
  };
  res.json(response);
});

// POST /api/bookings - Create a new booking
router.post("/", (req: Request, res: Response) => {
  const { bikeId, userId, startTime, endTime }: CreateBookingRequest = req.body;

  // Validate required fields
  if (!bikeId || !userId || !startTime || !endTime) {
    const response: ApiResponse<null> = {
      success: false,
      error: "bikeId, userId, startTime, and endTime are required",
    };
    res.status(400).json(response);
    return;
  }

  // Validate bike exists
  const bike = bikes.find((b) => b.id === bikeId);
  if (!bike) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Bike not found",
    };
    res.status(404).json(response);
    return;
  }

  // Validate dates
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Invalid date format",
    };
    res.status(400).json(response);
    return;
  }

  if (start >= end) {
    const response: ApiResponse<null> = {
      success: false,
      error: "startTime must be before endTime",
    };
    res.status(400).json(response);
    return;
  }

  if (start < new Date()) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Cannot book in the past",
    };
    res.status(400).json(response);
    return;
  }

  // Check availability
  if (!isBikeAvailable(bikeId, startTime, endTime)) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Bike is not available for the selected time period",
    };
    res.status(409).json(response);
    return;
  }

  // Calculate duration and total price
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const totalPrice = Math.round(durationHours * bike.pricePerHour * 100) / 100;

  // Create booking
  const newBooking: Booking = {
    id: generateId(),
    bikeId,
    userId,
    startTime,
    endTime,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);

  const response: ApiResponse<
    Booking & { bike: typeof bike; totalPrice: number }
  > = {
    success: true,
    data: {
      ...newBooking,
      bike,
      totalPrice,
    },
  };
  res.status(201).json(response);
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const bookingIndex = bookings.findIndex((b) => b.id === id);

  if (bookingIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Booking not found",
    };
    res.status(404).json(response);
    return;
  }

  const booking = bookings[bookingIndex];

  if (booking.status === "cancelled") {
    const response: ApiResponse<null> = {
      success: false,
      error: "Booking is already cancelled",
    };
    res.status(400).json(response);
    return;
  }

  // Mark as cancelled instead of deleting
  bookings[bookingIndex] = {
    ...booking,
    status: "cancelled",
  };

  const response: ApiResponse<{ message: string }> = {
    success: true,
    data: { message: "Booking cancelled successfully" },
  };
  res.json(response);
});

export default router;

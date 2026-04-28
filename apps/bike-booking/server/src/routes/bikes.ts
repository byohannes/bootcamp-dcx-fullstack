import { Router, Request, Response } from "express";
import { bikes, getBikeBookings, isBikeAvailable } from "../data";
import { ApiResponse, Bike } from "../types";

const router = Router();

// GET /api/bikes - List all bikes with availability info
router.get("/", (req: Request, res: Response) => {
  const { type, available } = req.query;
  const now = new Date().toISOString();
  const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  let filteredBikes = bikes;

  // Filter by type if provided
  if (type && typeof type === "string") {
    filteredBikes = filteredBikes.filter((bike) => bike.type === type);
  }

  // Add availability status to each bike
  const bikesWithAvailability = filteredBikes.map((bike) => ({
    ...bike,
    isAvailable: isBikeAvailable(bike.id, now, oneHourLater),
  }));

  // Filter by availability if requested
  if (available === "true") {
    const response: ApiResponse<(Bike & { isAvailable: boolean })[]> = {
      success: true,
      data: bikesWithAvailability.filter((b) => b.isAvailable),
    };
    res.json(response);
    return;
  }

  const response: ApiResponse<(Bike & { isAvailable: boolean })[]> = {
    success: true,
    data: bikesWithAvailability,
  };
  res.json(response);
});

// GET /api/bikes/:id - Get single bike with bookings
router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const bike = bikes.find((b) => b.id === id);

  if (!bike) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Bike not found",
    };
    res.status(404).json(response);
    return;
  }

  const bikeBookings = getBikeBookings(id);
  const now = new Date().toISOString();
  const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const response: ApiResponse<
    Bike & { isAvailable: boolean; bookings: typeof bikeBookings }
  > = {
    success: true,
    data: {
      ...bike,
      isAvailable: isBikeAvailable(id, now, oneHourLater),
      bookings: bikeBookings,
    },
  };
  res.json(response);
});

// GET /api/bikes/:id/availability - Check availability for specific time range
router.get("/:id/availability", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { startTime, endTime } = req.query;

  const bike = bikes.find((b) => b.id === id);

  if (!bike) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Bike not found",
    };
    res.status(404).json(response);
    return;
  }

  if (!startTime || !endTime) {
    const response: ApiResponse<null> = {
      success: false,
      error: "startTime and endTime are required",
    };
    res.status(400).json(response);
    return;
  }

  const available = isBikeAvailable(id, startTime as string, endTime as string);

  const response: ApiResponse<{ available: boolean }> = {
    success: true,
    data: { available },
  };
  res.json(response);
});

export default router;

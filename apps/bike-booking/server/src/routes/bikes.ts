import { Router, Request, Response } from "express";
import { Bike, Booking } from "../db/models";
import { ApiResponse } from "../types";

const router = Router();

// Helper to check if a bike is available for a time range
async function isBikeAvailable(
  bikeId: string,
  startTime: string,
  endTime: string,
): Promise<boolean> {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const overlappingBooking = await Booking.findOne({
    bikeId,
    status: "confirmed",
    $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
  });

  return !overlappingBooking;
}

// GET /api/bikes - List all bikes with availability info
router.get("/", async (req: Request, res: Response) => {
  try {
    const { type, available } = req.query;
    const now = new Date().toISOString();
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    let query: Record<string, unknown> = {};

    // Filter by type if provided
    if (type && typeof type === "string") {
      query.type = type;
    }

    const bikes = await Bike.find(query);

    // Add availability status to each bike
    const bikesWithAvailability = await Promise.all(
      bikes.map(async (bike) => ({
        ...bike.toJSON(),
        isAvailable: await isBikeAvailable(bike.id, now, oneHourLater),
      })),
    );

    // Filter by availability if requested
    if (available === "true") {
      const response: ApiResponse<typeof bikesWithAvailability> = {
        success: true,
        data: bikesWithAvailability.filter((b) => b.isAvailable),
      };
      res.json(response);
      return;
    }

    const response: ApiResponse<typeof bikesWithAvailability> = {
      success: true,
      data: bikesWithAvailability,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching bikes:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/bikes/:id - Get single bike with bookings
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const bike = await Bike.findById(id);

    if (!bike) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Bike not found",
      };
      res.status(404).json(response);
      return;
    }

    const bikeBookings = await Booking.find({
      bikeId: id,
      status: "confirmed",
    });
    const now = new Date().toISOString();
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const response: ApiResponse<unknown> = {
      success: true,
      data: {
        ...bike.toJSON(),
        isAvailable: await isBikeAvailable(id, now, oneHourLater),
        bookings: bikeBookings.map((b) => b.toJSON()),
      },
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching bike:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/bikes/:id/availability - Check availability for specific time range
router.get("/:id/availability", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { startTime, endTime } = req.query;

    const bike = await Bike.findById(id);

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

    const available = await isBikeAvailable(
      id,
      startTime as string,
      endTime as string,
    );

    const response: ApiResponse<{ available: boolean }> = {
      success: true,
      data: { available },
    };
    res.json(response);
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

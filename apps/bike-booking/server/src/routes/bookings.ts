import { Router, Request, Response } from "express";
import { Bike, Booking } from "../db/models";
import { ApiResponse, CreateBookingRequest } from "../types";

const router = Router();

// Helper to check if a bike is available for a time range
async function isBikeAvailable(
  bikeId: string,
  startTime: string,
  endTime: string,
  excludeBookingId?: string,
): Promise<boolean> {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const query: Record<string, unknown> = {
    bikeId,
    status: "confirmed",
    $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(query);
  return !overlappingBooking;
}

// GET /api/bookings - List all bookings (optionally filter by userId)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    let query: Record<string, unknown> = {};
    if (userId && typeof userId === "string") {
      query.userId = userId;
    }

    const bookings = await Booking.find(query).populate("bikeId");

    // Enrich bookings with bike info
    const enrichedBookings = bookings.map((booking) => {
      const bookingJSON = booking.toJSON();
      return {
        ...bookingJSON,
        bike: booking.bikeId
          ? (
              booking.bikeId as unknown as { toJSON: () => unknown }
            ).toJSON?.() || booking.bikeId
          : null,
        bikeId:
          (booking.bikeId as unknown as { _id?: string })?._id?.toString() ||
          booking.bikeId,
      };
    });

    const response: ApiResponse<typeof enrichedBookings> = {
      success: true,
      data: enrichedBookings,
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/bookings/:id - Get single booking
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const booking = await Booking.findById(id).populate("bikeId");

    if (!booking) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Booking not found",
      };
      res.status(404).json(response);
      return;
    }

    const bookingJSON = booking.toJSON();
    const response: ApiResponse<unknown> = {
      success: true,
      data: {
        ...bookingJSON,
        bike: booking.bikeId
          ? (
              booking.bikeId as unknown as { toJSON: () => unknown }
            ).toJSON?.() || booking.bikeId
          : null,
        bikeId:
          (booking.bikeId as unknown as { _id?: string })?._id?.toString() ||
          booking.bikeId,
      },
    };
    res.json(response);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// POST /api/bookings - Create a new booking
router.post("/", async (req: Request, res: Response) => {
  try {
    const { bikeId, userId, startTime, endTime }: CreateBookingRequest =
      req.body;

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
    const bike = await Bike.findById(bikeId);
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
    if (!(await isBikeAvailable(bikeId, startTime, endTime))) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Bike is not available for the selected time period",
      };
      res.status(409).json(response);
      return;
    }

    // Calculate duration and total price
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalPrice =
      Math.round(durationHours * bike.pricePerHour * 100) / 100;

    // Create booking
    const newBooking = new Booking({
      bikeId,
      userId,
      startTime: start,
      endTime: end,
      status: "confirmed",
    });

    await newBooking.save();

    // Re-check after insert to close the check-then-act race window.
    // If a concurrent request also booked an overlapping slot, roll this one
    // back so we never end up with two confirmed bookings for the same bike
    // and overlapping time range.
    if (!(await isBikeAvailable(bikeId, startTime, endTime, newBooking.id))) {
      await Booking.deleteOne({ _id: newBooking._id });
      const response: ApiResponse<null> = {
        success: false,
        error: "Bike is not available for the selected time period",
      };
      res.status(409).json(response);
      return;
    }

    const response: ApiResponse<unknown> = {
      success: true,
      data: {
        ...newBooking.toJSON(),
        bike: bike.toJSON(),
        totalPrice,
      },
    };
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Accept userId from header, query, or body so the caller's identity can
    // be verified against the booking owner. (Until proper auth is in place,
    // this prevents trivially cancelling someone else's booking by id.)
    const userId =
      (req.header("x-user-id") as string | undefined) ||
      (typeof req.query.userId === "string" ? req.query.userId : undefined) ||
      (req.body && typeof req.body.userId === "string"
        ? req.body.userId
        : undefined);

    if (!userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "userId is required to cancel a booking",
      };
      res.status(401).json(response);
      return;
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Booking not found",
      };
      res.status(404).json(response);
      return;
    }

    if (booking.userId.toString() !== userId) {
      const response: ApiResponse<null> = {
        success: false,
        error: "You are not allowed to cancel this booking",
      };
      res.status(403).json(response);
      return;
    }

    if (booking.status === "cancelled") {
      const response: ApiResponse<null> = {
        success: false,
        error: "Booking is already cancelled",
      };
      res.status(400).json(response);
      return;
    }

    // Don't allow cancelling bookings that have already ended.
    if (booking.endTime.getTime() <= Date.now()) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Cannot cancel a booking that has already ended",
      };
      res.status(400).json(response);
      return;
    }

    // Mark as cancelled instead of deleting
    booking.status = "cancelled";
    await booking.save();

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Booking cancelled successfully" },
    };
    res.json(response);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;

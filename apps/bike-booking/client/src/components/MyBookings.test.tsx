import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MyBookings } from "./MyBookings";
import type { Booking } from "../types";

// Mock the api module
vi.mock("../api", () => ({
  getBookings: vi.fn(),
  cancelBooking: vi.fn(),
}));

import { getBookings, cancelBooking } from "../api";

const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

const mockBookings: Booking[] = [
  {
    id: "booking-1",
    bikeId: "bike-1",
    userId: "user-1",
    startTime: futureDate.toISOString(),
    endTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    bike: {
      id: "bike-1",
      name: "Mountain Explorer",
      type: "mountain",
      description: "Great bike",
      pricePerHour: 15,
      imageUrl: "/images/bike.jpg",
      isAvailable: true,
    },
  },
  {
    id: "booking-2",
    bikeId: "bike-2",
    userId: "user-1",
    startTime: pastDate.toISOString(),
    endTime: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
    bike: {
      id: "bike-2",
      name: "City Cruiser",
      type: "city",
      description: "City bike",
      pricePerHour: 10,
      imageUrl: "/images/city.jpg",
      isAvailable: true,
    },
  },
  {
    id: "booking-3",
    bikeId: "bike-3",
    userId: "user-1",
    startTime: pastDate.toISOString(),
    endTime: new Date(pastDate.getTime() + 1 * 60 * 60 * 1000).toISOString(),
    status: "cancelled",
    bike: {
      id: "bike-3",
      name: "Road Racer",
      type: "road",
      description: "Fast bike",
      pricePerHour: 20,
      imageUrl: "/images/road.jpg",
      isAvailable: true,
    },
  },
];

describe("MyBookings", () => {
  const mockOnBack = vi.fn();
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
    (getBookings as ReturnType<typeof vi.fn>).mockResolvedValue(mockBookings);
    (cancelBooking as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it("renders My Bookings heading", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    expect(screen.getByText("My Bookings")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    expect(
      screen.getByRole("button", { name: /back to bikes/i }),
    ).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    fireEvent.click(screen.getByRole("button", { name: /back to bikes/i }));

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("shows loading state initially", () => {
    (getBookings as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    expect(screen.getByText("Loading bookings...")).toBeInTheDocument();
  });

  it("fetches bookings for the user", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(getBookings).toHaveBeenCalledWith(mockUserId);
    });
  });

  it("displays upcoming bookings section", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
    });
  });

  it("displays past bookings section", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Past Bookings")).toBeInTheDocument();
    });
  });

  it("displays bike names in bookings", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
      expect(screen.getByText("City Cruiser")).toBeInTheDocument();
      expect(screen.getByText("Road Racer")).toBeInTheDocument();
    });
  });

  it("shows cancel button for upcoming confirmed bookings", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("does not show cancel button for past bookings", async () => {
    (getBookings as ReturnType<typeof vi.fn>).mockResolvedValue([
      mockBookings[1],
    ]);

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("City Cruiser")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /cancel/i }),
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no bookings", async () => {
    (getBookings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(
        screen.getByText("You don't have any bookings yet."),
      ).toBeInTheDocument();
    });
  });

  it("shows browse button in empty state", async () => {
    (getBookings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /browse available bikes/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows error when fetching bookings fails", async () => {
    (getBookings as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Failed to load"),
    );

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });
  });

  it("shows confirmation dialog when cancel is clicked", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByText("Cancel Booking")).toBeInTheDocument();
    expect(
      screen.getByText(/are you sure you want to cancel/i),
    ).toBeInTheDocument();
  });

  it("closes confirmation dialog when No is clicked", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(screen.getByRole("button", { name: /no, keep booking/i }));

    expect(screen.queryByText("Cancel Booking")).not.toBeInTheDocument();
  });

  it("cancels booking when Yes is clicked", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /yes, cancel booking/i }),
    );

    await waitFor(() => {
      expect(cancelBooking).toHaveBeenCalledWith("booking-1", mockUserId);
    });
  });

  it("shows success message after cancellation", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /yes, cancel booking/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Booking cancelled successfully"),
      ).toBeInTheDocument();
    });
  });

  it("displays booking status badges", async () => {
    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText("confirmed").length).toBeGreaterThan(0);
      expect(screen.getByText("cancelled")).toBeInTheDocument();
    });
  });

  it("keeps in-progress bookings in the upcoming list and cancellable", async () => {
    // A booking whose start time is in the past but end time is still in the
    // future should be treated as active (cancellable), not a past booking.
    const now = Date.now();
    const inProgressBooking: Booking = {
      id: "booking-in-progress",
      bikeId: "bike-4",
      userId: "user-1",
      startTime: new Date(now - 30 * 60 * 1000).toISOString(),
      endTime: new Date(now + 30 * 60 * 1000).toISOString(),
      status: "confirmed",
      bike: {
        id: "bike-4",
        name: "In Progress Bike",
        type: "mountain",
        description: "Currently rented",
        pricePerHour: 12,
        imageUrl: "/images/inprogress.jpg",
        isAvailable: false,
      },
    };

    (getBookings as ReturnType<typeof vi.fn>).mockResolvedValue([
      inProgressBooking,
    ]);

    render(<MyBookings userId={mockUserId} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getByText("In Progress Bike")).toBeInTheDocument();
    });

    expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
    expect(screen.queryByText("Past Bookings")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingForm } from "./BookingForm";
import type { Bike } from "../types";

// Mock the api module
vi.mock("../api", () => ({
  createBooking: vi.fn(),
  checkAvailability: vi.fn(),
}));

import { createBooking, checkAvailability } from "../api";

const mockBike: Bike = {
  id: "bike-1",
  name: "Mountain Explorer",
  type: "mountain",
  description: "Perfect for trails and adventures",
  pricePerHour: 15,
  imageUrl: "/images/mountain.jpg",
  isAvailable: true,
};

describe("BookingForm", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    (checkAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (createBooking as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "booking-1",
      bikeId: mockBike.id,
      userId: mockUserId,
      startTime: "2026-06-15T10:00:00",
      endTime: "2026-06-15T12:00:00",
      status: "confirmed",
      totalPrice: 30,
    });
  });

  it("renders the bike name in the header", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText(`Book ${mockBike.name}`)).toBeInTheDocument();
  });

  it("displays bike details", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText(mockBike.description)).toBeInTheDocument();
    expect(
      screen.getByText(`£${mockBike.pricePerHour}/hour`),
    ).toBeInTheDocument();
    expect(screen.getByText(mockBike.type)).toBeInTheDocument();
  });

  it("renders date and time inputs", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  it("calls onCancel when back button is clicked", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back to bikes/i });
    fireEvent.click(backButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("shows error when check availability is clicked without all fields", async () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    // Fill only start date, missing other fields
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-06-15" },
    });

    const checkButton = screen.getByRole("button", {
      name: /check availability/i,
    });
    // Button should be disabled when not all fields are filled
    expect(checkButton).toBeDisabled();
  });

  it("renders check availability button", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByRole("button", { name: /check availability/i }),
    ).toBeInTheDocument();
  });

  it("renders confirm booking button", () => {
    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    expect(
      screen.getByRole("button", { name: /confirm booking/i }),
    ).toBeInTheDocument();
  });

  it("shows error when check availability fails", async () => {
    (checkAvailability as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error"),
    );

    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    // Fill in form fields
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: "12:00" },
    });

    const checkButton = screen.getByRole("button", {
      name: /check availability/i,
    });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows unavailable message when bike is not available", async () => {
    (checkAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: "12:00" },
    });

    const checkButton = screen.getByRole("button", {
      name: /check availability/i,
    });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(
        screen.getByText(/bike is not available for the selected time period/i),
      ).toBeInTheDocument();
    });
  });

  it("calls onSuccess when booking is created successfully", async () => {
    const mockBooking = {
      id: "booking-1",
      bikeId: mockBike.id,
      userId: mockUserId,
      startTime: "2026-06-15T10:00:00",
      endTime: "2026-06-15T12:00:00",
      status: "confirmed",
      totalPrice: 30,
    };
    (createBooking as ReturnType<typeof vi.fn>).mockResolvedValue(mockBooking);
    (checkAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: "12:00" },
    });

    // First check availability
    const checkButton = screen.getByRole("button", {
      name: /check availability/i,
    });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/bike is available/i)).toBeInTheDocument();
    });

    // Now submit
    const submitButton = screen.getByRole("button", {
      name: /confirm booking/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockBooking);
    });
  });

  it("shows error when booking creation fails", async () => {
    (createBooking as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Booking failed"),
    );
    (checkAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    render(
      <BookingForm
        bike={mockBike}
        userId={mockUserId}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-06-15" },
    });
    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: "12:00" },
    });

    // First check availability
    const checkButton = screen.getByRole("button", {
      name: /check availability/i,
    });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/bike is available/i)).toBeInTheDocument();
    });

    // Now submit
    const submitButton = screen.getByRole("button", {
      name: /confirm booking/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Booking failed")).toBeInTheDocument();
    });
  });
});

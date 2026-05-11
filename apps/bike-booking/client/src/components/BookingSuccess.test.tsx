import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BookingSuccess } from "./BookingSuccess";
import type { Booking } from "../types";

describe("BookingSuccess", () => {
  const mockBooking: Booking = {
    id: "booking-123",
    bikeId: "bike-1",
    userId: "user-1",
    startTime: "2026-06-15T10:00:00.000Z",
    endTime: "2026-06-15T14:00:00.000Z",
    status: "confirmed",
    totalPrice: 60,
    bike: {
      id: "bike-1",
      name: "Mountain Explorer",
      type: "mountain",
      description: "Great bike",
      pricePerHour: 15,
      imageUrl: "/images/bike.jpg",
      isAvailable: true,
    },
  };

  const mockOnViewBookings = vi.fn();
  const mockOnBookAnother = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders success message", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
    expect(
      screen.getByText("Your bike has been successfully booked."),
    ).toBeInTheDocument();
  });

  it("displays success icon", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("displays bike name", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
  });

  it("displays start and end times", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.getByText("Start:")).toBeInTheDocument();
    expect(screen.getByText("End:")).toBeInTheDocument();
  });

  it("displays total price in pounds", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.getByText("£60.00")).toBeInTheDocument();
  });

  it("displays booking ID", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(
      screen.getByText(`Booking ID: ${mockBooking.id}`),
    ).toBeInTheDocument();
  });

  it("renders View My Bookings button", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(
      screen.getByRole("button", { name: /view my bookings/i }),
    ).toBeInTheDocument();
  });

  it("renders Book Another Bike button", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(
      screen.getByRole("button", { name: /book another bike/i }),
    ).toBeInTheDocument();
  });

  it("calls onViewBookings when button is clicked", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view my bookings/i }));

    expect(mockOnViewBookings).toHaveBeenCalledTimes(1);
  });

  it("calls onBookAnother when button is clicked", () => {
    render(
      <BookingSuccess
        booking={mockBooking}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /book another bike/i }));

    expect(mockOnBookAnother).toHaveBeenCalledTimes(1);
  });

  it("handles booking without totalPrice", () => {
    const bookingWithoutPrice = { ...mockBooking, totalPrice: undefined };

    render(
      <BookingSuccess
        booking={bookingWithoutPrice}
        onViewBookings={mockOnViewBookings}
        onBookAnother={mockOnBookAnother}
      />,
    );

    expect(screen.queryByText(/£/)).not.toBeInTheDocument();
  });
});

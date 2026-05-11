import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BikeCard } from "./BikeCard";
import type { Bike } from "../types";

describe("BikeCard", () => {
  const mockBike: Bike = {
    id: "bike-1",
    name: "Mountain Explorer",
    type: "mountain",
    description: "Perfect for trails",
    pricePerHour: 15,
    imageUrl: "/images/mountain-bike.jpg",
    isAvailable: true,
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders bike name", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
  });

  it("renders bike type with emoji", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    expect(screen.getByText(/⛰️ mountain/i)).toBeInTheDocument();
  });

  it("renders bike description", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("Perfect for trails")).toBeInTheDocument();
  });

  it("renders price in UK pounds", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("£15/hour")).toBeInTheDocument();
  });

  it("shows Available status for available bikes", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("✓ Available")).toBeInTheDocument();
  });

  it("shows Booked status for unavailable bikes", () => {
    const unavailableBike = { ...mockBike, isAvailable: false };
    render(<BikeCard bike={unavailableBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("Booked")).toBeInTheDocument();
  });

  it("enables Book Now button for available bikes", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    const button = screen.getByRole("button", { name: /book now/i });
    expect(button).not.toBeDisabled();
  });

  it("disables button for unavailable bikes", () => {
    const unavailableBike = { ...mockBike, isAvailable: false };
    render(<BikeCard bike={unavailableBike} onSelect={mockOnSelect} />);

    const button = screen.getByRole("button", { name: /unavailable/i });
    expect(button).toBeDisabled();
  });

  it("calls onSelect when Book Now is clicked", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    const button = screen.getByRole("button", { name: /book now/i });
    fireEvent.click(button);

    expect(mockOnSelect).toHaveBeenCalledWith(mockBike);
  });

  it("does not call onSelect when clicking disabled button", () => {
    const unavailableBike = { ...mockBike, isAvailable: false };
    render(<BikeCard bike={unavailableBike} onSelect={mockOnSelect} />);

    const button = screen.getByRole("button", { name: /unavailable/i });
    fireEvent.click(button);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("renders different type emojis correctly", () => {
    const { rerender } = render(
      <BikeCard bike={mockBike} onSelect={mockOnSelect} />,
    );
    expect(screen.getByText(/⛰️/)).toBeInTheDocument();

    rerender(
      <BikeCard bike={{ ...mockBike, type: "road" }} onSelect={mockOnSelect} />,
    );
    expect(screen.getByText(/🏎️/)).toBeInTheDocument();

    rerender(
      <BikeCard bike={{ ...mockBike, type: "city" }} onSelect={mockOnSelect} />,
    );
    expect(screen.getByText(/🏙️/)).toBeInTheDocument();

    rerender(
      <BikeCard
        bike={{ ...mockBike, type: "electric" }}
        onSelect={mockOnSelect}
      />,
    );
    expect(screen.getByText(/⚡/)).toBeInTheDocument();
  });

  it("renders bike image with alt text", () => {
    render(<BikeCard bike={mockBike} onSelect={mockOnSelect} />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "Mountain Explorer");
  });

  it("applies unavailable class when bike is not available", () => {
    const unavailableBike = { ...mockBike, isAvailable: false };
    const { container } = render(
      <BikeCard bike={unavailableBike} onSelect={mockOnSelect} />,
    );

    expect(
      container.querySelector(".bike-card.unavailable"),
    ).toBeInTheDocument();
  });

  it("shows Currently Booked overlay for unavailable bikes", () => {
    const unavailableBike = { ...mockBike, isAvailable: false };
    render(<BikeCard bike={unavailableBike} onSelect={mockOnSelect} />);

    expect(screen.getByText("Currently Booked")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BikeList } from "./BikeList";
import type { Bike } from "../types";

// Mock the api module
vi.mock("../api", () => ({
  getBikes: vi.fn(),
}));

import { getBikes } from "../api";

const mockBikes: Bike[] = [
  {
    id: "bike-1",
    name: "Mountain Explorer",
    type: "mountain",
    description: "Great for trails",
    pricePerHour: 15,
    imageUrl: "/images/mountain.jpg",
    isAvailable: true,
  },
  {
    id: "bike-2",
    name: "City Cruiser",
    type: "city",
    description: "Perfect for urban rides",
    pricePerHour: 10,
    imageUrl: "/images/city.jpg",
    isAvailable: true,
  },
  {
    id: "bike-3",
    name: "Road Racer",
    type: "road",
    description: "Built for speed",
    pricePerHour: 20,
    imageUrl: "/images/road.jpg",
    isAvailable: false,
  },
];

describe("BikeList", () => {
  const mockOnSelectBike = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (getBikes as ReturnType<typeof vi.fn>).mockResolvedValue(mockBikes);
  });

  it("renders the Available Bikes heading", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    expect(screen.getByText("Available Bikes")).toBeInTheDocument();
  });

  it("renders filter buttons for all bike types", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mountain/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /road/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /city/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /electric/i }),
    ).toBeInTheDocument();
  });

  it("shows loading skeletons while fetching bikes", () => {
    (getBikes as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    expect(document.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
  });

  it("displays bikes after loading", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    expect(screen.getByText("City Cruiser")).toBeInTheDocument();
    expect(screen.getByText("Road Racer")).toBeInTheDocument();
  });

  it("calls getBikes on mount", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(getBikes).toHaveBeenCalledWith(undefined);
    });
  });

  it("filters bikes when type button is clicked", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    const mountainButton = screen.getByRole("button", { name: /mountain/i });
    fireEvent.click(mountainButton);

    await waitFor(() => {
      expect(getBikes).toHaveBeenCalledWith("mountain");
    });
  });

  it("shows active state on selected filter button", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    const allButton = screen.getByRole("button", { name: /all/i });
    expect(allButton).toHaveClass("active");

    const mountainButton = screen.getByRole("button", { name: /mountain/i });
    fireEvent.click(mountainButton);

    await waitFor(() => {
      expect(mountainButton).toHaveClass("active");
    });
  });

  it("displays error message when API fails", async () => {
    (getBikes as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error"),
    );

    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows empty state when no bikes are available", async () => {
    (getBikes as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(
        screen.getByText("No bikes available for the selected type."),
      ).toBeInTheDocument();
    });
  });

  it("shows reset button in empty state", async () => {
    (getBikes as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /show all bikes/i }),
      ).toBeInTheDocument();
    });
  });

  it("calls onSelectBike when a bike card is clicked", async () => {
    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    const bookButton = screen.getAllByRole("button", { name: /book now/i })[0];
    fireEvent.click(bookButton);

    expect(mockOnSelectBike).toHaveBeenCalledWith(mockBikes[0]);
  });

  it("can dismiss error alert", async () => {
    (getBikes as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error"),
    );

    render(<BikeList onSelectBike={mockOnSelectBike} />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText("Network error")).not.toBeInTheDocument();
  });
});

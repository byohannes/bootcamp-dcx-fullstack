import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock the API module
vi.mock("./api", () => ({
  getBikes: vi.fn(() =>
    Promise.resolve([
      {
        id: "bike-1",
        name: "Mountain Explorer",
        type: "mountain",
        description: "Perfect for trails",
        pricePerHour: 15,
        imageUrl: "/images/mountain-bike.jpg",
        isAvailable: true,
      },
      {
        id: "bike-2",
        name: "City Cruiser",
        type: "city",
        description: "Urban commuting",
        pricePerHour: 10,
        imageUrl: "/images/city-bike.jpg",
        isAvailable: false,
      },
    ]),
  ),
  getBike: vi.fn(),
  getBookings: vi.fn(() => Promise.resolve([])),
  createBooking: vi.fn(),
  cancelBooking: vi.fn(),
  checkAvailability: vi.fn(),
  login: vi.fn(() =>
    Promise.resolve({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
    }),
  ),
  register: vi.fn(() =>
    Promise.resolve({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date().toISOString(),
    }),
  ),
  getUser: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders the app header", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Bike Booking",
    );
  });

  it("renders navigation with login button when not authenticated", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /browse bikes/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("loads and displays bikes", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Mountain Explorer")).toBeInTheDocument();
    });

    expect(screen.getByText("City Cruiser")).toBeInTheDocument();
  });

  it("shows available bikes section", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Available Bikes")).toBeInTheDocument();
    });
  });

  it("navigates to login when clicking Login button", async () => {
    render(<App />);

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });

  it("displays filter buttons for bike types", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /mountain/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /road/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /city/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /electric/i }),
    ).toBeInTheDocument();
  });
});

import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UserProvider } from "./UserContext";
import { useUser } from "./useUser";
import type { User } from "../types";

// Test component to consume context
function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useUser();

  return (
    <div>
      <span data-testid="is-authenticated">
        {isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="user-name">{user?.name || "none"}</span>
      <span data-testid="user-email">{user?.email || "none"}</span>
      <button
        onClick={() =>
          login({
            id: "user-1",
            email: "test@example.com",
            name: "Test User",
            createdAt: "2026-01-01T00:00:00.000Z",
          })
        }
      >
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("UserContext", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides initial unauthenticated state", () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-name")).toHaveTextContent("none");
  });

  it("loads user from localStorage on mount", () => {
    const storedUser: User = {
      id: "user-1",
      email: "stored@example.com",
      name: "Stored User",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-name")).toHaveTextContent("Stored User");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "stored@example.com",
    );
  });

  it("handles invalid JSON in localStorage gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "bike-booking-user",
    );
  });

  it("updates state when login is called", async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");

    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "test@example.com",
    );
  });

  it("saves user to localStorage on login", async () => {
    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "bike-booking-user",
      expect.stringContaining("test@example.com"),
    );
  });

  it("clears state when logout is called", async () => {
    const storedUser: User = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("true");

    await act(async () => {
      screen.getByRole("button", { name: "Logout" }).click();
    });

    expect(screen.getByTestId("is-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user-name")).toHaveTextContent("none");
  });

  it("removes user from localStorage on logout", async () => {
    const storedUser: User = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>,
    );

    await act(async () => {
      screen.getByRole("button", { name: "Logout" }).click();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      "bike-booking-user",
    );
  });
});

describe("useUser hook", () => {
  it("throws error when used outside UserProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useUser must be used within a UserProvider",
    );

    consoleSpy.mockRestore();
  });
});

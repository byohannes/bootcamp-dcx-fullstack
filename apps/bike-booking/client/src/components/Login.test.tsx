import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Login } from "./Login";

// Mock the api module
vi.mock("../api", () => ({
  login: vi.fn(),
}));

import { login } from "../api";

describe("Login", () => {
  const mockOnLogin = vi.fn();
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (login as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("renders login form", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to book your ride")).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders password input", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("renders link to registration", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create one/i }),
    ).toBeInTheDocument();
  });

  it("calls onRegister when create account is clicked", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.click(screen.getByRole("button", { name: /create one/i }));

    expect(mockOnRegister).toHaveBeenCalledTimes(1);
  });

  it("allows typing in email field", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("allows typing in password field", () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput).toHaveValue("password123");
  });

  it("calls login API when form is submitted", async () => {
    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("calls onLogin with user after successful login", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    (login as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it("shows loading state during login", async () => {
    (login as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });
  });

  it("disables inputs during loading", async () => {
    (login as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });
  });

  it("shows error message when login fails", async () => {
    (login as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid credentials"),
    );

    render(<Login onLogin={mockOnLogin} onRegister={mockOnRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});

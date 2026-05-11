import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Register } from "./Register";

// Mock the api module
vi.mock("../api", () => ({
  register: vi.fn(),
}));

import { register } from "../api";

describe("Register", () => {
  const mockOnRegister = vi.fn();
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (register as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("renders registration form", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(
      screen.getByRole("heading", { name: /create account/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Join us and start booking bikes"),
    ).toBeInTheDocument();
  });

  it("renders name input", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders password input", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders confirm password input", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("renders create account button", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("renders link to login", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls onLogin when sign in link is clicked", () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  it("shows error when passwords do not match", async () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  it("shows error when password is too short", async () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters"),
      ).toBeInTheDocument();
    });
  });

  it("calls register API with correct data", async () => {
    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });
  });

  it("calls onRegister with user after successful registration", async () => {
    const mockUser = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    (register as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockOnRegister).toHaveBeenCalledWith(mockUser);
    });
  });

  it("shows loading state during registration", async () => {
    (register as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });
  });

  it("disables inputs during loading", async () => {
    (register as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
    });
  });

  it("shows error when registration fails", async () => {
    (register as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Email already exists"),
    );

    render(<Register onRegister={mockOnRegister} onLogin={mockOnLogin} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });
});

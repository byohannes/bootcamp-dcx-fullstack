import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders success alert correctly", () => {
    render(<Alert type="success" message="Operation successful!" />);

    expect(screen.getByText("Operation successful!")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("renders error alert correctly", () => {
    render(<Alert type="error" message="Something went wrong" />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("renders warning alert correctly", () => {
    render(<Alert type="warning" message="Please be careful" />);

    expect(screen.getByText("Please be careful")).toBeInTheDocument();
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });

  it("renders info alert correctly", () => {
    render(<Alert type="info" message="Here is some information" />);

    expect(screen.getByText("Here is some information")).toBeInTheDocument();
    expect(screen.getByText("ℹ")).toBeInTheDocument();
  });

  it("shows close button when onClose is provided", () => {
    const onClose = vi.fn();
    render(<Alert type="info" message="Test message" onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it("does not show close button when onClose is not provided", () => {
    render(<Alert type="info" message="Test message" />);

    const closeButton = screen.queryByRole("button", { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Alert type="info" message="Test message" onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies correct CSS class for each type", () => {
    const { rerender, container } = render(
      <Alert type="success" message="Test" />,
    );
    expect(container.querySelector(".alert-success")).toBeInTheDocument();

    rerender(<Alert type="error" message="Test" />);
    expect(container.querySelector(".alert-error")).toBeInTheDocument();

    rerender(<Alert type="warning" message="Test" />);
    expect(container.querySelector(".alert-warning")).toBeInTheDocument();

    rerender(<Alert type="info" message="Test" />);
    expect(container.querySelector(".alert-info")).toBeInTheDocument();
  });
});

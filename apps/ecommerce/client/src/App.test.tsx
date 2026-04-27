import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the heading", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "E-commerce App",
    );
  });

  it("renders the counter button", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /count is/i });
    expect(button).toBeInTheDocument();
  });

  it("increments counter when button is clicked", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /count is 0/i });
    fireEvent.click(button);

    expect(
      screen.getByRole("button", { name: /count is 1/i }),
    ).toBeInTheDocument();
  });

  it("increments counter multiple times", () => {
    render(<App />);

    const button = screen.getByRole("button", { name: /count is/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(
      screen.getByRole("button", { name: /count is 3/i }),
    ).toBeInTheDocument();
  });

  it("displays HMR instruction text", () => {
    render(<App />);

    expect(screen.getByText(/save to test HMR/i)).toBeInTheDocument();
  });
});

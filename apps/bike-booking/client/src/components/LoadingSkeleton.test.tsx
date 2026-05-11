import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingSkeleton } from "./LoadingSkeleton";

describe("LoadingSkeleton", () => {
  it("renders single card skeleton by default", () => {
    const { container } = render(<LoadingSkeleton />);

    expect(container.querySelectorAll(".skeleton")).toHaveLength(1);
    expect(container.querySelector(".skeleton-card")).toBeInTheDocument();
  });

  it("renders multiple skeletons when count is provided", () => {
    const { container } = render(<LoadingSkeleton count={3} />);

    expect(container.querySelectorAll(".skeleton")).toHaveLength(3);
  });

  it("renders card type skeleton with image and content", () => {
    const { container } = render(<LoadingSkeleton type="card" />);

    expect(container.querySelector(".skeleton-image")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-content")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-title")).toBeInTheDocument();
    expect(container.querySelectorAll(".skeleton-text")).toHaveLength(2);
  });

  it("renders text type skeleton", () => {
    const { container } = render(<LoadingSkeleton type="text" />);

    expect(container.querySelector(".skeleton-line")).toBeInTheDocument();
    // Text type has skeleton-text class on the container but no skeleton-content
    expect(container.querySelector(".skeleton-content")).toBe(null);
  });

  it("renders avatar type skeleton", () => {
    const { container } = render(<LoadingSkeleton type="avatar" />);

    expect(container.querySelector(".skeleton-circle")).toBeInTheDocument();
  });

  it("applies correct CSS class for type", () => {
    const { container, rerender } = render(<LoadingSkeleton type="card" />);
    expect(container.querySelector(".skeleton-card")).toBeInTheDocument();

    rerender(<LoadingSkeleton type="text" />);
    expect(container.querySelector(".skeleton-text")).toBeInTheDocument();

    rerender(<LoadingSkeleton type="avatar" />);
    expect(container.querySelector(".skeleton-avatar")).toBeInTheDocument();
  });

  it("renders correct number of skeletons for each type", () => {
    const { container, rerender } = render(
      <LoadingSkeleton count={4} type="card" />,
    );
    expect(container.querySelectorAll(".skeleton-card")).toHaveLength(4);

    rerender(<LoadingSkeleton count={2} type="text" />);
    expect(container.querySelectorAll(".skeleton-text")).toHaveLength(2);

    rerender(<LoadingSkeleton count={3} type="avatar" />);
    expect(container.querySelectorAll(".skeleton-avatar")).toHaveLength(3);
  });
});

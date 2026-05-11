import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and message", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?"),
    ).toBeInTheDocument();
  });

  it("renders default Yes and No buttons", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  it("renders custom button text", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: "No" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when overlay is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(
      screen.getByText("Confirm Action").closest(".confirm-dialog-overlay")!,
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not call onCancel when dialog content is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Confirm Action"));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("shows Processing... when isLoading is true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(
      screen.getByRole("button", { name: "Processing..." }),
    ).toBeInTheDocument();
  });

  it("disables buttons when isLoading is true", () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByRole("button", { name: "No" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Processing..." }),
    ).toBeDisabled();
  });

  it("applies danger variant class", () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} variant="danger" />,
    );

    expect(
      container.querySelector(".confirm-dialog.danger"),
    ).toBeInTheDocument();
  });

  it("applies warning variant class", () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} variant="warning" />,
    );

    expect(
      container.querySelector(".confirm-dialog.warning"),
    ).toBeInTheDocument();
  });

  it("applies info variant class", () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} variant="info" />,
    );

    expect(container.querySelector(".confirm-dialog.info")).toBeInTheDocument();
  });
});

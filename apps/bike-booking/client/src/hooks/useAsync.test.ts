import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatDateTime,
  formatDate,
  calculateHours,
  getBikeTypeEmoji,
  isUpcomingBooking,
} from "./useAsync";

describe("formatPrice", () => {
  it("formats price in UK pounds", () => {
    expect(formatPrice(15)).toBe("£15.00");
  });

  it("formats decimal prices correctly", () => {
    expect(formatPrice(15.5)).toBe("£15.50");
  });

  it("formats zero price", () => {
    expect(formatPrice(0)).toBe("£0.00");
  });

  it("formats large prices with proper formatting", () => {
    expect(formatPrice(1000)).toBe("£1,000.00");
  });
});

describe("formatDateTime", () => {
  it("formats date and time correctly", () => {
    const date = "2024-06-15T14:30:00.000Z";
    const formatted = formatDateTime(date);

    // Should contain both date and time parts
    expect(formatted).toContain("15");
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = "2024-06-15T14:30:00.000Z";
    const formatted = formatDate(date);

    // Should contain the day
    expect(formatted).toContain("15");
  });
});

describe("calculateHours", () => {
  it("calculates duration in hours correctly", () => {
    const start = "2024-06-15T10:00:00.000Z";
    const end = "2024-06-15T12:00:00.000Z";

    expect(calculateHours(start, end)).toBe(2);
  });

  it("calculates partial hours correctly", () => {
    const start = "2024-06-15T10:00:00.000Z";
    const end = "2024-06-15T11:30:00.000Z";

    expect(calculateHours(start, end)).toBe(1.5);
  });

  it("handles same start and end time", () => {
    const time = "2024-06-15T10:00:00.000Z";

    expect(calculateHours(time, time)).toBe(0);
  });

  it("handles multi-day durations", () => {
    const start = "2024-06-15T10:00:00.000Z";
    const end = "2024-06-16T10:00:00.000Z";

    expect(calculateHours(start, end)).toBe(24);
  });
});

describe("getBikeTypeEmoji", () => {
  it("returns mountain emoji for mountain type", () => {
    expect(getBikeTypeEmoji("mountain")).toBe("⛰️");
  });

  it("returns racing emoji for road type", () => {
    expect(getBikeTypeEmoji("road")).toBe("🏎️");
  });

  it("returns city emoji for city type", () => {
    expect(getBikeTypeEmoji("city")).toBe("🏙️");
  });

  it("returns electric emoji for electric type", () => {
    expect(getBikeTypeEmoji("electric")).toBe("⚡");
  });

  it("returns default bike emoji for unknown type", () => {
    expect(getBikeTypeEmoji("unknown")).toBe("🚲");
  });
});

describe("isUpcomingBooking", () => {
  it("returns true for future confirmed booking", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    expect(isUpcomingBooking(futureDate, "confirmed")).toBe(true);
  });

  it("returns false for past confirmed booking", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    expect(isUpcomingBooking(pastDate, "confirmed")).toBe(false);
  });

  it("returns false for future cancelled booking", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    expect(isUpcomingBooking(futureDate, "cancelled")).toBe(false);
  });

  it("returns false for past cancelled booking", () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    expect(isUpcomingBooking(pastDate, "cancelled")).toBe(false);
  });
});

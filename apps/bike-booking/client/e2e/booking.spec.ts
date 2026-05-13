import { test, expect } from "@playwright/test";
import { registerTestUser, loginViaStorage } from "./helpers";

const API = "http://localhost:5001/api";

/**
 * Pick a future booking window unique to this test run so re-running the suite
 * doesn't collide with bookings created by previous runs.
 */
function uniqueBookingWindow() {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(9, 0, 0, 0);
  // Combine wall-clock and randomness so parallel tests + reruns each get
  // their own non-overlapping slot.
  const offset =
    (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1_000_000)) %
    (60 * 24 * 30);
  start.setMinutes(offset);
  start.setSeconds(0, 0);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  const yyyy = start.getFullYear();
  const mm = String(start.getMonth() + 1).padStart(2, "0");
  const dd = String(start.getDate()).padStart(2, "0");
  const startDate = `${yyyy}-${mm}-${dd}`;
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  return {
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    startDate,
    endDate,
    startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
  };
}

test.describe("Booking flow", () => {
  test("logged-in user can book a bike", async ({ page, request }) => {
    const user = await registerTestUser(request);
    await loginViaStorage(page, user);

    await page.goto("/");

    // "Book Now" is the bike-card CTA. Use exact match so we don't pick up
    // the "My Bookings" nav button.
    const bookNow = page
      .getByRole("button", { name: "Book Now", exact: true })
      .first();
    await expect(bookNow).toBeVisible();
    await bookNow.click();

    await expect(page.getByRole("heading", { name: /^book /i })).toBeVisible();

    const slot = uniqueBookingWindow();

    await page.getByLabel(/start date/i).fill(slot.startDate);
    await page.getByLabel(/start time/i).fill(slot.startTime);
    await page.getByLabel(/end date/i).fill(slot.endDate);
    await page.getByLabel(/end time/i).fill(slot.endTime);

    // Confirm Booking is disabled until availability is checked.
    await page.getByRole("button", { name: /check availability/i }).click();
    await expect(page.getByText(/bike is available/i)).toBeVisible();

    await page.getByRole("button", { name: /confirm booking/i }).click();

    await expect(page.getByText(/booking confirmed/i)).toBeVisible();
  });

  test("my bookings page lists the new booking", async ({ page, request }) => {
    const user = await registerTestUser(request);
    await loginViaStorage(page, user);

    const bikesRes = await request.get(`${API}/bikes`);
    const bikesBody = await bikesRes.json();
    const bikes = (bikesBody.data ?? []) as Array<{ id: string; name: string }>;
    expect(bikes.length).toBeGreaterThan(0);

    const slot = uniqueBookingWindow();

    // Try each bike until one accepts the booking; tolerates re-run conflicts.
    let createdBike: { id: string; name: string } | null = null;
    for (const bike of bikes) {
      const res = await request.post(`${API}/bookings`, {
        data: {
          bikeId: bike.id,
          userId: user.id,
          startTime: slot.startISO,
          endTime: slot.endISO,
        },
      });
      if (res.ok()) {
        createdBike = bike;
        break;
      }
    }
    expect(
      createdBike,
      "could not create a booking on any bike",
    ).not.toBeNull();

    await page.goto("/");
    await page.getByRole("button", { name: /my bookings/i }).click();

    await expect(page.getByText(createdBike!.name)).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home page loads with header and bike list", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /bike booking/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /browse bikes/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^login$/i })).toBeVisible();
  });

  test("can navigate to login and switch to register", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /create one/i }).click();
    await expect(page.getByLabel(/name/i)).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can register and is logged in", async ({ page }) => {
    const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const name = `Reg User ${unique}`;
    const email = `reg-${unique}@example.com`;

    await page.goto("/");
    await page.getByRole("button", { name: /^login$/i }).click();
    await page.getByRole("button", { name: /create one/i }).click();

    await page.getByLabel(/name/i).fill(name);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel("Password", { exact: true }).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("Password123!");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(new RegExp(`hi, ${name}`, "i"))).toBeVisible();
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
  });

  test("invalid login shows an error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^login$/i }).click();

    await page.getByLabel(/email/i).fill("nobody@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.locator(".form-error")).toBeVisible();
  });
});

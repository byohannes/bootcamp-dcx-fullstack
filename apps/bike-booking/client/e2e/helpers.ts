import { expect, type Page, type APIRequestContext } from "@playwright/test";

const API_BASE = "http://localhost:5001/api";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

/**
 * Register a new user via the API. Email is randomized so tests are isolated.
 */
export async function registerTestUser(
  request: APIRequestContext,
  overrides: Partial<TestUser> = {},
): Promise<TestUser> {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const user = {
    name: overrides.name ?? `Test User ${unique}`,
    email: overrides.email ?? `e2e-${unique}@example.com`,
    password: overrides.password ?? "Password123!",
  };

  const res = await request.post(`${API_BASE}/users/register`, {
    data: user,
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBe(true);

  return { ...user, id: body.data.id };
}

/**
 * Seed the user into localStorage so the app boots already authenticated.
 * This avoids depending on the Login UI for every test.
 */
export async function loginViaStorage(page: Page, user: TestUser) {
  await page.addInitScript((u) => {
    localStorage.setItem(
      "bike-booking-user",
      JSON.stringify({ id: u.id, name: u.name, email: u.email }),
    );
  }, user);
}

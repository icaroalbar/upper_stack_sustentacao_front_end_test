import { test, expect } from "@playwright/test";
import { loginAndExpectTickets } from "./helpers/auth";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

const routesToCheck = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/tickets",
  "/tickets/placeholder-id",
  "/dashboard",
  "/clients",
  "/users",
  "/first-access",
  "/settings/profile",
  "/settings/theme",
];

async function loginIfPossible(page: import("@playwright/test").Page) {
  if (!email || !password) return false;

  await loginAndExpectTickets(page, email, password);
  return true;
}

test("rotas nao devem retornar 404", async ({ page }) => {
  await loginIfPossible(page);

  const failingRoutes: string[] = [];

  for (const path of routesToCheck) {
    await page.goto(path, { waitUntil: "domcontentloaded" });

    const has404 = await page
      .getByText("This page could not be found.")
      .isVisible();

    if (has404) {
      failingRoutes.push(path);
    }
  }

  if (failingRoutes.length > 0) {
    console.log("Rotas com 404:", failingRoutes.join(", "));
  }

  expect(failingRoutes, "Rotas que retornaram 404").toEqual([]);
});

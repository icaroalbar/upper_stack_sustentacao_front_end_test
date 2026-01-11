import { test, expect } from "@playwright/test";
import { loginAndExpectTickets } from "./helpers/auth";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test("login com sucesso", async ({ page }) => {
  test.skip(
    !email || !password,
    "Defina TEST_USER_EMAIL e TEST_USER_PASSWORD para executar este teste."
  );

  await loginAndExpectTickets(page, email as string, password as string);
  await expect(page.getByRole("heading", { name: /Tickets/i })).toBeVisible();
});

import { test, expect } from "@playwright/test";
import { loginAndExpectTickets } from "./helpers/auth";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test("login e logout", async ({ page }) => {
  test.skip(
    !email || !password,
    "Defina TEST_USER_EMAIL e TEST_USER_PASSWORD para executar este teste."
  );

  await loginAndExpectTickets(page, email, password);

  const avatarTrigger = page.locator(
    '[data-slot="avatar-fallback"], [data-slot="avatar"]'
  );
  await expect(avatarTrigger.first()).toBeVisible();
  await avatarTrigger.first().click();

  const logoutItem = page.getByRole("menuitem", { name: "Sair" });
  const logoutVisible = await logoutItem.isVisible().catch(() => false);
  if (logoutVisible) {
    await logoutItem.click();
  } else {
    await page.getByText("Sair").click();
  }

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: /Seja bem vindo/i })).toBeVisible();

  await page.goto("/tickets");
  await expect(page).toHaveURL(/\/login/);
});

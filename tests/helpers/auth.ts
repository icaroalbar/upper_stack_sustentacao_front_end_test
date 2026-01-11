import { type Page } from "@playwright/test";

type LoginOptions = {
  timeoutMs?: number;
};

export async function loginAndExpectTickets(
  page: Page,
  email: string,
  password: string,
  options: LoginOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const alert = page.locator('[data-slot="alert"]');
  const alertDescription = page.locator('[data-slot="alert-description"]');

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Enviar" }).click();

  const authResponsePromise = page
    .waitForResponse(
      (response) => {
        const url = response.url();
        return (
          response.request().method() === "POST" &&
          url.includes("/api/auth") &&
          url.includes("credentials")
        );
      },
      { timeout: timeoutMs }
    )
    .then(async (response) => {
      const contentType = response.headers()["content-type"] || "";
      let body: unknown = null;
      try {
        body = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
      } catch {
        body = null;
      }
      return {
        status: response.status(),
        url: response.url(),
        body,
      };
    })
    .catch(() => null);

  const outcome = await Promise.race([
    page.waitForURL(/\/tickets/, { timeout: timeoutMs }).then(() => ({
      ok: true as const,
    })),
    alert.waitFor({ state: "visible", timeout: timeoutMs }).then(async () => ({
      ok: false as const,
      message: (await alertDescription.innerText()).trim(),
    })),
  ]).catch(() => null);

  if (outcome?.ok) {
    return;
  }

  let alertMessage = outcome?.message?.trim() || "";
  if (!alertMessage || alertMessage === "[object Object]") {
    const alertVisible = await alert.isVisible().catch(() => false);
    if (alertVisible) {
      alertMessage = (await alertDescription.innerText()).trim();
    }
  }

  const authResponse = await authResponsePromise;
  let authDetail = "";
  if (authResponse) {
    const authBody =
      authResponse.body && typeof authResponse.body === "object"
        ? (authResponse.body as Record<string, unknown>)
        : null;
    const authError = authBody?.error || authBody?.message;
    let authBodyText = "";
    if (authResponse.body) {
      if (typeof authResponse.body === "string") {
        authBodyText = authResponse.body.trim();
      } else {
        try {
          authBodyText = JSON.stringify(authResponse.body);
        } catch {
          authBodyText = "";
        }
      }
    }
    if (authBodyText.length > 500) {
      authBodyText = `${authBodyText.slice(0, 500)}...`;
    }
    authDetail = `Auth response ${authResponse.status} ${authResponse.url}`;
    if (authError) {
      authDetail += ` (${String(authError)})`;
    }
    if (authBodyText) {
      authDetail += ` body=${authBodyText}`;
    }
  }

  const detailParts = [alertMessage, authDetail].filter(
    (value) => value && value !== "[object Object]"
  );
  const detail = detailParts.length
    ? detailParts.join(" | ")
    : `Login did not reach /tickets (current: ${page.url()})`;

  throw new Error(`Login failed: ${detail}`);
}

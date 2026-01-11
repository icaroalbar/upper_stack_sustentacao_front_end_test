import { defineConfig, devices } from "@playwright/test";
import { chromium as playwrightChromium } from "playwright";
import fs from "node:fs";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const localAudioLibPath = "/tmp/apt/libasound2/usr/lib/x86_64-linux-gnu";
const envChromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const systemChromiumCandidates = [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/snap/bin/chromium",
];

const resolvePlaywrightChromiumExecutable = () => {
  try {
    const executablePath = playwrightChromium.executablePath();
    return fs.existsSync(executablePath) ? executablePath : undefined;
  } catch {
    return undefined;
  }
};

const chromiumExecutable =
  envChromiumExecutable ||
  resolvePlaywrightChromiumExecutable() ||
  systemChromiumCandidates.find((path) => fs.existsSync(path));

if (fs.existsSync(localAudioLibPath)) {
  process.env.LD_LIBRARY_PATH = [
    localAudioLibPath,
    process.env.LD_LIBRARY_PATH,
  ]
    .filter(Boolean)
    .join(":");
}

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  workers: 1,
  fullyParallel: true,
  retries: 1,
  reporter: "list",
  use: {
    baseURL,
    headless: true,
    chromiumSandbox: false,
    launchOptions: {
      executablePath: chromiumExecutable,
    },
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

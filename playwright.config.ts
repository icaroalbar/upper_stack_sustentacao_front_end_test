import { defineConfig, devices } from "@playwright/test";
import { chromium as playwrightChromium } from "playwright";
import fs from "node:fs";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
const localAudioLibPath = "/tmp/apt/libasound2/usr/lib/x86_64-linux-gnu";
const envChromiumExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  process.env.CHROME_BIN ||
  process.env.PUPPETEER_EXECUTABLE_PATH;
const systemChromiumCandidates = [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/opt/google/chrome/chrome",
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

const isSnapShim = (path: string) => {
  try {
    const stats = fs.lstatSync(path);
    if (stats.isSymbolicLink()) {
      const realPath = fs.realpathSync(path);
      return realPath.includes("/snap") || realPath.endsWith("/usr/bin/snap");
    }

    return stats.size < 100 * 1024;
  } catch {
    return false;
  }
};

const resolveSystemChromiumExecutable = () =>
  systemChromiumCandidates.find(
    (path) => fs.existsSync(path) && !isSnapShim(path)
  );

const chromiumExecutable =
  envChromiumExecutable ||
  resolveSystemChromiumExecutable() ||
  resolvePlaywrightChromiumExecutable();
const crashpadArgs = [
  "--disable-crashpad",
  "--disable-crashpad-for-testing",
  "--disable-crash-reporter",
  "--disable-breakpad",
  "--disable-features=Crashpad",
  "--no-crash-upload",
];
const allProjects = [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      chromiumSandbox: false,
      launchOptions: {
        executablePath: chromiumExecutable,
        args: crashpadArgs,
      },
    },
  },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
];
const selectedBrowser = process.env.PLAYWRIGHT_BROWSER;
const projects = selectedBrowser
  ? allProjects.filter((project) => project.name === selectedBrowser)
  : allProjects.filter((project) => project.name === "chromium");

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
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects,
});

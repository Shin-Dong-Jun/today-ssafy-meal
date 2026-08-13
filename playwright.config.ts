import { defineConfig, devices } from "@playwright/test";

const isContinuousIntegration = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 1 : 0,
  workers: isContinuousIntegration ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

import { expect, test } from "@playwright/test";

const THURSDAY_NOON_KST = new Date("2026-08-13T12:00:00+09:00");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(THURSDAY_NOON_KST);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("샘플 데이터는 실제 날짜와 오늘 식단으로 오인되지 않게 표시한다", async ({
  page,
}) => {
  await page.goto("/");

  const notice = page.locator(".meal-data-notice--sample");
  const mealNav = page.getByRole("navigation", {
    name: "예시 식단 바로가기",
  });

  await expect(notice).toBeVisible();
  await expect(notice).toContainText("샘플");
  await expect(notice).toContainText(
    "실제 SSAFY 식단이 아닌 화면 확인용 예시예요.",
  );
  await expect(notice).toContainText("예시 기간");
  await expect(page.getByRole("heading", { name: "화면 예시 식단" })).toBeVisible();
  await expect(mealNav).toBeVisible();
  await expect(mealNav.getByRole("link", { name: "예시 안내" })).toBeVisible();
  await expect(mealNav.getByRole("link", { name: "예시 1" })).toBeVisible();

  await expect(page.locator("#today-section")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /룰렛/ })).toHaveCount(0);
  await expect(page.locator(".meal-card time")).toHaveCount(0);
  await expect(page.locator('[aria-current="date"]')).toHaveCount(0);
});

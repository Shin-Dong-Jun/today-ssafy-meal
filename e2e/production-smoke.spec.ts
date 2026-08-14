import { expect, test } from "@playwright/test";

test("운영 build가 현재 식단 상태와 무관하게 핵심 화면을 렌더링한다", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];

  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle(/오늘 싸피밥/);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.locator("#meal-data-notice")).toBeVisible();
  await expect(page.locator("#main-content")).toBeVisible();
  await expect(page.locator(".weekly-section")).toBeVisible();
  await expect(page.locator(".meal-card")).toHaveCount(5);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("테스트 메뉴");
  await expect(page.locator("body")).not.toContainText("테스트 식단표");
  expect(runtimeErrors).toEqual([]);
});

import { expect, test } from "@playwright/test";

const VIEWPORT_WIDTHS = [
  360, 390, 599, 600, 767, 768, 1099, 1100, 1280, 1440,
] as const;
const PIXEL_TOLERANCE = 1;

for (const width of VIEWPORT_WIDTHS) {
  test(`${width}px에서 식단 section의 폭과 가로 overflow가 정상이다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const todaySection = page.locator(".today-section");
    const weeklySection = page.locator(".weekly-section");

    await expect(todaySection).toBeVisible();
    await expect(weeklySection).toBeVisible();

    const [todayBox, weeklyBox] = await Promise.all([
      todaySection.boundingBox(),
      weeklySection.boundingBox(),
    ]);

    if (!todayBox || !weeklyBox) {
      throw new Error("식단 section의 layout box를 계산하지 못했습니다.");
    }

    expect(
      Math.abs(todayBox.width - weeklyBox.width),
      `${width}px section width mismatch`,
    ).toBeLessThanOrEqual(PIXEL_TOLERANCE);
    expect(
      Math.abs(todayBox.x - weeklyBox.x),
      `${width}px left edge mismatch`,
    ).toBeLessThanOrEqual(PIXEL_TOLERANCE);
    expect(
      Math.abs(
        todayBox.x +
          todayBox.width -
          (weeklyBox.x + weeklyBox.width),
      ),
      `${width}px right edge mismatch`,
    ).toBeLessThanOrEqual(PIXEL_TOLERANCE);

    const overflowPixels = await page.evaluate(() => {
      const root = document.documentElement;

      return (
        Math.max(root.scrollWidth, document.body.scrollWidth) -
        root.clientWidth
      );
    });

    expect(
      overflowPixels,
      `${width}px horizontal overflow`,
    ).toBeLessThanOrEqual(PIXEL_TOLERANCE);
  });
}

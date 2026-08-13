import { expect, test } from "@playwright/test";

const VERIFIED_WEEK_RANGE = "8월 10일~14일";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("지난 식단 안내를 기존 데이터 상태 카드에 통합한다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-20T12:00:00+09:00"));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const notice = page.locator(
    ".meal-data-notice--date-verified.meal-data-notice--past",
  );

  await expect(notice).toBeVisible();
  await expect(notice.locator(".meal-data-freshness--past")).toHaveText(
    "지난 식단",
  );
  await expect(notice.locator(".meal-data-status")).toHaveText("날짜 확인");
  await expect(
    notice.getByText(`${VERIFIED_WEEK_RANGE} 식단을 표시하고 있어요.`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(notice).toContainText("이번 주 식단은 아직 등록되지 않았어요.");
  await expect(page.locator(".week-status-banner")).toHaveCount(0);
  await expect(page.locator(".weekday-strip")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "이번 주 식단 준비 중" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "지난 식단" })).toBeVisible();

  const colors = await notice.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      borderLeft: styles.borderLeftColor,
    };
  });
  expect(colors).toEqual({
    background: "rgb(255, 250, 240)",
    borderLeft: "rgb(184, 113, 8)",
  });

  const weeklySectionTop = await page
    .locator("#weekly-section")
    .evaluate((section) => section.getBoundingClientRect().top);
  expect(weeklySectionTop).toBeLessThan(800);

  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return (
      Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth
    );
  });

  expect(overflow).toBeLessThanOrEqual(1);
});

test("다음 주 식단도 같은 상태 카드의 정보 variant로 표시한다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-03T12:00:00+09:00"));
  await page.goto("/");

  const notice = page.locator(
    ".meal-data-notice--date-verified.meal-data-notice--future",
  );

  await expect(notice).toBeVisible();
  await expect(notice.locator(".meal-data-freshness--future")).toHaveText(
    "예정 식단",
  );
  await expect(
    notice.getByText(`${VERIFIED_WEEK_RANGE} 식단을 미리 표시하고 있어요.`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(notice).toContainText(
    "해당 기간이 시작되기 전에 미리 확인하고 있어요.",
  );
  await expect(page.getByRole("heading", { name: "예정 식단" })).toBeVisible();

  const colors = await notice.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      borderLeft: styles.borderLeftColor,
    };
  });
  expect(colors).toEqual({
    background: "rgb(234, 241, 255)",
    borderLeft: "rgb(37, 99, 235)",
  });
});

test("현재 주에는 freshness badge를 추가하지 않는다", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-13T12:00:00+09:00"));
  await page.goto("/");

  const notice = page.locator(".meal-data-notice--date-verified");

  await expect(notice).toBeVisible();
  await expect(notice.locator(".meal-data-status")).toHaveText("날짜 확인");
  await expect(notice.locator(".meal-data-freshness")).toHaveCount(0);
  await expect(notice).not.toHaveClass(/meal-data-notice--(past|future)/);
  await expect(page.locator(".weekday-strip")).toBeVisible();
  await expect(page.getByRole("heading", { name: "이번 주 식단" })).toBeVisible();
});

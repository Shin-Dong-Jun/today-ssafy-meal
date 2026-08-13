import { expect, test } from "@playwright/test";

const THURSDAY_NOON_KST = new Date("2026-08-13T12:00:00+09:00");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(THURSDAY_NOON_KST);
});

test("날짜 미확인 데이터는 확정된 오늘 식단처럼 표시하지 않는다", async ({
  page,
}) => {
  await page.goto("/");

  const notice = page.locator(".meal-data-notice--date-unverified");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("날짜 미확인");
  await expect(notice).toContainText(
    "확인 가능한 메뉴만 옮겼지만 날짜는 확인되지 않았어요.",
  );
  await expect(notice).toContainText("임시 표시 기간");

  const todayEmptyState = page.locator(
    ".today-card .empty-state--verification",
  );
  await expect(todayEmptyState).toBeVisible();
  await expect(todayEmptyState).toContainText(/날짜.*(확인|특정)/);

  await expect(page.getByRole("button", { name: /룰렛/ })).toHaveCount(0);
  await expect(page.locator(".weekday-chip--today")).toHaveCount(0);
  await expect(page.locator(".meal-card--today")).toHaveCount(0);
  await expect(page.locator('[aria-current="date"]')).toHaveCount(0);
});

test("출처와 메뉴별 불확실 문구를 숨기지 않고 확인할 수 있다", async ({
  page,
}) => {
  await page.goto("/");

  const sourceNotes = page.locator("details.meal-data-source-notes");
  await expect(sourceNotes).toBeVisible();
  await sourceNotes.locator("summary").click();
  await expect(sourceNotes).toContainText("날짜 머리글을 확인할 수 없어");

  const uncertaintyDetails = page.locator("details.meal-uncertainty-details");
  await expect(uncertaintyDetails.first()).toBeVisible();
  await uncertaintyDetails.first().locator("summary").click();
  await expect(
    uncertaintyDetails.first().getByRole("list", {
      name: "사진 판독 확인 필요 항목",
    }),
  ).toBeVisible();
  await expect(uncertaintyDetails.first()).toContainText("확실하지 않습니다");
});

test("날짜 미확인 데이터는 임시 날짜가 지나도 지난 식단으로 단정하지 않는다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-20T12:00:00+09:00"));
  await page.goto("/");

  const notice = page.locator(".meal-data-notice--date-unverified");
  await expect(notice).toBeVisible();
  await expect(notice).not.toHaveClass(/meal-data-notice--(past|future)/);
  await expect(notice.locator(".meal-data-freshness")).toHaveCount(0);
  await expect(page.getByText("지난 식단", { exact: true })).toHaveCount(0);
});

test("모바일 quick nav는 스크롤 위치에 맞춰 현재 section을 갱신한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");

  const quickNav = page.getByRole("navigation", { name: "페이지 바로가기" });
  const todayLink = quickNav.locator('a[href="#today-section"]');
  const weeklyLink = quickNav.locator('a[href="#weekly-section"]');

  await expect(quickNav).toBeVisible();
  await expect(todayLink).toHaveAttribute("aria-current", "location");

  await page.locator("#weekly-section").evaluate((section) => {
    section.scrollIntoView({ block: "start" });
  });

  await expect(weeklyLink).toHaveAttribute("aria-current", "location");
  await expect(todayLink).not.toHaveAttribute("aria-current", "location");
});

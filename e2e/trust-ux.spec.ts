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
    "날짜는 확인하지 못했어요. 사진에서 읽은 메뉴만 순서대로 보여드려요.",
  );
  await expect(notice).not.toContainText("임시 표시 기간");

  await expect(page.locator("#today-section")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /룰렛/ })).toHaveCount(0);
  await expect(page.locator("#meal-roulette-dialog")).toHaveCount(0);
  await expect(page.locator(".section-date")).toHaveCount(0);
  await expect(page.locator(".weekday-strip")).toHaveCount(0);
  await expect(page.locator(".meal-card time")).toHaveCount(0);
  await expect(page.locator(".weekday-chip--today")).toHaveCount(0);
  await expect(page.locator(".meal-card--today")).toHaveCount(0);
  await expect(page.locator(".card-today-label")).toHaveCount(0);
  await expect(page.locator('[aria-current="date"]')).toHaveCount(0);
});

test("320x568 첫 화면에서 첫 판독 식단과 메뉴를 바로 확인할 수 있다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const fixedNav = page.getByRole("navigation", { name: "페이지 바로가기" });
  const firstMealTitle = page.locator(".meal-card h3").first();
  const firstMenuHeading = page.locator(".meal-card h4").first();
  const firstMenuItem = page.locator(".meal-card .weekly-menu-list li").first();

  await expect(fixedNav).toBeVisible();
  await expect(firstMealTitle).toBeVisible();
  await expect(firstMealTitle).toHaveText("식단 1");
  await expect(firstMenuHeading).toBeVisible();
  await expect(firstMenuItem).toBeVisible();

  const [navBox, titleBox, menuHeadingBox, menuItemBox] = await Promise.all([
    fixedNav.boundingBox(),
    firstMealTitle.boundingBox(),
    firstMenuHeading.boundingBox(),
    firstMenuItem.boundingBox(),
  ]);

  if (!navBox || !titleBox || !menuHeadingBox || !menuItemBox) {
    throw new Error("첫 식단과 고정 내비게이션의 layout box를 계산하지 못했습니다.");
  }

  for (const [label, box] of [
    ["first meal title", titleBox],
    ["first menu heading", menuHeadingBox],
    ["first menu item", menuItemBox],
  ] as const) {
    expect(box.y, `${label} viewport top`).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, `${label} fixed nav overlap`).toBeLessThanOrEqual(
      navBox.y,
    );
  }

  const overflowPixels = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
  });

  expect(overflowPixels, "320px horizontal overflow").toBeLessThanOrEqual(1);
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

test("모바일 quick nav는 안내와 식단 보기 section으로 정확히 이동한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const quickNav = page.getByRole("navigation", { name: "페이지 바로가기" });
  const noticeLink = quickNav.getByRole("link", { name: "안내", exact: true });
  const weeklyLink = quickNav.getByRole("link", {
    name: "식단 보기",
    exact: true,
  });

  await expect(quickNav).toBeVisible();
  await expect(quickNav.getByRole("link")).toHaveCount(2);
  await expect(noticeLink).toHaveAttribute("href", "#meal-data-notice");
  await expect(weeklyLink).toHaveAttribute("href", "#weekly-section");
  await expect(noticeLink).toHaveAttribute("aria-current", "location");

  await weeklyLink.click();

  await expect(page).toHaveURL(/#weekly-section$/);
  await expect(page.locator("#weekly-section")).toBeFocused();
  await expect(weeklyLink).toHaveAttribute("aria-current", "location");
  await expect(noticeLink).not.toHaveAttribute("aria-current", "location");

  const getWeeklySectionTop = () =>
    page
      .locator("#weekly-section")
      .evaluate((section) => section.getBoundingClientRect().top);

  await expect.poll(getWeeklySectionTop).toBeLessThan(80);

  const weeklySectionTop = await getWeeklySectionTop();
  expect(weeklySectionTop).toBeGreaterThanOrEqual(0);

  await noticeLink.click();

  await expect(page).toHaveURL(/#meal-data-notice$/);
  await expect(page.locator("#meal-data-notice")).toBeFocused();
  await expect(noticeLink).toHaveAttribute("aria-current", "location");
  await expect(weeklyLink).not.toHaveAttribute("aria-current", "location");
});

import { expect, test } from "@playwright/test";

import {
  E2E_VERIFIED_SOURCE_NOTE,
  E2E_VERIFIED_UNCERTAIN_TEXT,
} from "../src/data/fixtures/e2eVerifiedMeal";

const VERIFIED_WEEK_RANGE = "8월 10일~14일";
const VERIFIED_MEAL_NAV_ITEMS = [
  { label: "오늘", targetId: "today-section" },
  { label: "월", targetId: "meal-2026-08-10" },
  { label: "화", targetId: "meal-2026-08-11" },
  { label: "수", targetId: "meal-2026-08-12" },
  { label: "목", targetId: "meal-2026-08-13" },
  { label: "금", targetId: "meal-2026-08-14" },
] as const;

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

  const mealNav = page.getByRole("navigation", {
    name: "지난 식단 바로가기",
  });
  const noticeLink = mealNav.getByRole("link", { name: "안내", exact: true });
  await expect(noticeLink).toHaveAttribute(
    "href",
    "#meal-data-notice",
  );

  const colors = await notice.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      background: styles.backgroundColor,
      borderLeft: styles.borderLeftColor,
    };
  });
  expect(colors).toEqual({
    background: "rgb(242, 244, 246)",
    borderLeft: "rgb(98, 108, 122)",
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

  const mealNav = page.getByRole("navigation", {
    name: "예정 식단 바로가기",
  });
  const noticeLink = mealNav.getByRole("link", { name: "안내", exact: true });
  await expect(noticeLink).toHaveAttribute(
    "href",
    "#meal-data-notice",
  );

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

test("현재 주에는 식단 상태 안내를 표시하지 않는다", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-08-13T12:00:00+09:00"));
  await page.goto("/");

  await expect(page.locator("#meal-data-notice")).toHaveCount(0);
  await expect(page.locator(".meal-data-freshness")).toHaveCount(0);
  await expect(page.locator(".weekday-strip")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "오늘의 메뉴" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "이번 주 식단" })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "식단 바로가기" })
      .getByRole("link", { name: "오늘", exact: true }),
  ).toHaveAttribute("href", "#today-section");
  await expect(page.getByText(E2E_VERIFIED_SOURCE_NOTE)).toHaveCount(0);
  await expect(page.getByText(E2E_VERIFIED_UNCERTAIN_TEXT)).toHaveCount(0);
});

test("대표 음식은 메인 배지와 파란 강조를 사용하고 단백질 표시는 초록색으로 구분한다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-13T12:00:00+09:00"));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const todayCard = page.locator("#today-section");
  const todayRepresentativeItems = todayCard.locator(
    ".today-menu-list .is-representative-item",
  );

  await expect(todayRepresentativeItems).toHaveCount(2);

  for (const menuName of ["계란말이", "춘권튀김"]) {
    const representativeItem = todayCard
      .locator(".today-menu-list li")
      .filter({ hasText: menuName });

    await expect(representativeItem).toHaveClass(/is-representative-item/);
    await expect(
      representativeItem.getByText("메인", { exact: true }),
    ).toBeVisible();
    await expect(representativeItem).toHaveCSS("color", "rgb(0, 74, 198)");
  }

  const proteinRepresentativeItem = todayCard
    .locator(".today-menu-list li")
    .filter({ hasText: "계란말이" });

  await expect(proteinRepresentativeItem).toHaveClass(/is-protein-item/);
  await expect(
    proteinRepresentativeItem.locator(".menu-item-marker"),
  ).toHaveCSS("background-color", "rgb(28, 110, 73)");

  const weeklyThursdayCard = page.locator("#meal-2026-08-13");
  await expect(
    weeklyThursdayCard.locator(".weekly-menu-list .is-representative-item"),
  ).toHaveCount(2);
  await expect(
    weeklyThursdayCard.getByText("메인", { exact: true }),
  ).toHaveCount(2);

  const overflowPixels = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
  });

  expect(overflowPixels).toBeLessThanOrEqual(1);
});

test("검증된 현재 주 식단 navigator는 월~금 날짜 target과 click 이동을 제공한다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-13T12:00:00+09:00"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const mealNav = page.getByRole("navigation", { name: "식단 바로가기" });
  const links = mealNav.getByRole("link");

  await expect(mealNav).toBeVisible();
  await expect(links).toHaveCount(VERIFIED_MEAL_NAV_ITEMS.length);

  for (const { label, targetId } of VERIFIED_MEAL_NAV_ITEMS) {
    const link = mealNav.locator(`a[href="#${targetId}"]`);

    await expect(link).toContainText(label);
    await expect(page.locator(`#${targetId}`)).toHaveCount(1);
  }

  const wednesdayLink = mealNav.locator('a[href="#meal-2026-08-12"]');

  await wednesdayLink.click();

  await expect(page).toHaveURL(/#meal-2026-08-12$/);
  await expect(page.locator("#meal-2026-08-12")).toBeFocused();
  await expect(page.locator("#meal-2026-08-12")).toHaveAccessibleName(
    "수요일 8월 12일",
  );
  await page.waitForTimeout(250);
  await expect(wednesdayLink).toHaveAttribute("aria-current", "location");
  await expect(mealNav.locator('a[aria-current="location"]')).toHaveCount(1);

  await page.locator("body").dispatchEvent("wheel", { deltaY: 100 });
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(mealNav.locator('a[href="#meal-2026-08-14"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
});

test("검증된 현재 주 식단 navigator는 스크롤 위치를 반영한다", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-08-13T12:00:00+09:00"));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");

  const mealNav = page.getByRole("navigation", { name: "식단 바로가기" });
  const thursdayLink = mealNav.locator('a[href="#meal-2026-08-13"]');

  await page.locator("#meal-2026-08-13").evaluate((mealCard) => {
    mealCard.scrollIntoView({ block: "center" });
  });

  await expect(thursdayLink).toHaveAttribute("aria-current", "location");
  await expect(mealNav.locator('a[aria-current="location"]')).toHaveCount(1);

  const overflowPixels = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
  });

  expect(overflowPixels).toBeLessThanOrEqual(1);
});

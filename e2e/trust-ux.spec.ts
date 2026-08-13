import { expect, test } from "@playwright/test";

const THURSDAY_NOON_KST = new Date("2026-08-13T12:00:00+09:00");
const UNVERIFIED_MEAL_NAV_ITEMS = [
  { label: "안내", targetId: "meal-data-notice" },
  ...Array.from({ length: 5 }, (_, index) => ({
    label: `식단 ${index + 1}`,
    targetId: `meal-slot-${index + 1}`,
  })),
];

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(THURSDAY_NOON_KST);
  await page.emulateMedia({ reducedMotion: "reduce" });
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

  const fixedNav = page.getByRole("navigation", { name: "사진 순서 바로가기" });
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

for (const { width, height } of [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
] as const) {
  test(`${width}px에서 안내와 날짜 미확인 식단 1~5 navigator를 표시한다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");

    const mealNav = page.getByRole("navigation", {
      name: "사진 순서 바로가기",
    });
    const links = mealNav.getByRole("link");

    await expect(mealNav).toBeVisible();
    await expect(links).toHaveCount(UNVERIFIED_MEAL_NAV_ITEMS.length);

    for (const { label, targetId } of UNVERIFIED_MEAL_NAV_ITEMS) {
      const link = mealNav.getByRole("link", { name: label, exact: true });

      await expect(link).toHaveAttribute("href", `#${targetId}`);
      await expect(page.locator(`#${targetId}`)).toHaveCount(1);
    }

    const overflowPixels = await page.evaluate(() => {
      const root = document.documentElement;
      return (
        Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth
      );
    });

    expect(
      overflowPixels,
      `${width}px meal navigator horizontal overflow`,
    ).toBeLessThanOrEqual(1);
  });
}

test("날짜 미확인 식단 navigator click은 hash, focus, 현재 위치를 갱신한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const mealNav = page.getByRole("navigation", {
    name: "사진 순서 바로가기",
  });
  const fourthLink = mealNav.locator('a[href="#meal-slot-4"]');

  await expect(mealNav).toBeVisible();
  await fourthLink.click();

  await expect(page).toHaveURL(/#meal-slot-4$/);
  await expect(page.locator("#meal-slot-4")).toBeFocused();
  await expect(page.locator("#meal-slot-4")).toHaveAccessibleName("식단 4");
  await page.waitForTimeout(250);
  await expect(fourthLink).toHaveAttribute("aria-current", "location");
  await expect(mealNav.locator('a[aria-current="location"]')).toHaveCount(1);
});

test("날짜 미확인 식단 navigator는 스크롤 위치를 반영한다", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");

  const mealNav = page.getByRole("navigation", {
    name: "사진 순서 바로가기",
  });
  const secondLink = mealNav.locator('a[href="#meal-slot-2"]');

  await page.locator("#meal-slot-2").evaluate((mealCard) => {
    mealCard.scrollIntoView({ block: "center" });
  });

  await expect(secondLink).toHaveAttribute("aria-current", "location");
  await expect(mealNav.locator('a[aria-current="location"]')).toHaveCount(1);
});

for (const width of [768, 1440] as const) {
  test(`${width}px desktop에서는 식단 navigator를 sticky rail로 표시한다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const mealNav = page.getByRole("navigation", {
      name: "사진 순서 바로가기",
    });

    await expect(mealNav).toBeVisible();
    await expect(mealNav.getByRole("link")).toHaveCount(
      UNVERIFIED_MEAL_NAV_ITEMS.length,
    );

    const hasStickyContainer = await mealNav.evaluate((navigator) => {
      let element: Element | null = navigator;

      while (element) {
        if (getComputedStyle(element).position === "sticky") {
          return true;
        }

        element = element.parentElement;
      }

      return false;
    });
    expect(hasStickyContainer).toBe(true);

    const overflowPixels = await page.evaluate(() => {
      const root = document.documentElement;
      return (
        Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth
      );
    });
    expect(overflowPixels).toBeLessThanOrEqual(1);
  });
}

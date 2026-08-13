import { expect, test } from "@playwright/test";

import { MEAL_DECISION_STORAGE_KEY } from "../src/utils/mealDecision";

const THURSDAY_NOON_KST = new Date("2026-08-13T12:00:00+09:00");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(THURSDAY_NOON_KST);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
});

test("룰렛 선택을 저장하고 새로고침 후 복원·공유·취소한다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        (window as Window & { __sharePayload?: ShareData }).__sharePayload =
          data;
      },
    });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "룰렛 열기" }).click();
  const spinButton = page.getByRole("button", {
    name: "룰렛 돌리고 저장하기",
  });
  await expect(spinButton).toBeFocused();
  await spinButton.click();

  const decisionPanel = page.getByLabel("저장된 오늘의 메뉴 선택");
  await expect(decisionPanel).toContainText("오늘의 픽");
  await expect(decisionPanel).toContainText("메뉴 A · 메뉴 1 · 사진 상단");
  await expect(page.locator(".today-menu-group--selected")).toContainText(
    "오늘의 픽",
  );

  await page.getByRole("button", { name: "룰렛 닫기" }).click();
  await expect(
    page.getByRole("button", { name: "다시 고르기" }),
  ).toBeFocused();
  await page.reload();

  await expect(decisionPanel).toContainText("메뉴 A · 메뉴 1 · 사진 상단");
  await expect(page.locator("#meal-roulette-dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "다시 고르기" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#meal-roulette-dialog")).toHaveCount(0);
  await expect(decisionPanel).toBeVisible();
  await expect(
    page.getByRole("button", { name: "다시 고르기" }),
  ).toBeFocused();

  await page.getByRole("button", { name: "공유", exact: true }).click();
  await expect(decisionPanel).toContainText("선택 메뉴를 공유했어요.");
  const sharePayload = await page.evaluate(
    () => (window as Window & { __sharePayload?: ShareData }).__sharePayload,
  );
  expect(sharePayload?.text).toContain("오늘 싸피밥 · 8월 13일");
  expect(sharePayload?.text).toContain("계란말이");
  expect(sharePayload?.text).not.toContain("춘권튀김");

  await page.getByRole("button", { name: "선택 취소" }).click();
  await expect(page.getByRole("button", { name: "룰렛 열기" })).toBeFocused();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), MEAL_DECISION_STORAGE_KEY),
  ).toBeNull();
});

test("일반 모션에서는 회전 시간이 끝난 뒤 선택을 저장한다", async ({
  page,
}) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "룰렛 열기" }).click();

  const spinButton = page.getByRole("button", {
    name: "룰렛 돌리고 저장하기",
  });
  await spinButton.click();
  await expect(page.getByRole("button", { name: "돌아가는 중…" })).toBeDisabled();
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toHaveCount(0);

  await page.waitForTimeout(1_900);
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toBeVisible();
});

test("회전 중 닫으면 완료 타이머를 취소하고 기존 선택을 유지한다", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "룰렛 열기" }).click();
  await page
    .getByRole("button", { name: "룰렛 돌리고 저장하기" })
    .click();
  await page.getByRole("button", { name: "룰렛 닫기" }).click();
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("button", { name: "다시 고르기" }).click();
  await page
    .getByRole("button", { name: "새로 돌려서 저장하기" })
    .click();
  await page.getByRole("button", { name: "룰렛 닫기" }).click();
  await page.waitForTimeout(1_900);

  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toContainText(
    "메뉴 A · 메뉴 1 · 사진 상단",
  );
});

test("손상된 저장값은 화면 오류 없이 제거한다", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [MEAL_DECISION_STORAGE_KEY, "{broken"] as const,
  );
  await page.reload();

  await expect(page.getByRole("button", { name: "룰렛 열기" })).toBeVisible();
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), MEAL_DECISION_STORAGE_KEY),
  ).toBeNull();
});

for (const width of [360, 767, 768, 1099, 1100] as const) {
  test(`${width}px에서도 저장된 선택 UI가 가로 overflow 없이 표시된다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "룰렛 열기" }).click();
    await page
      .getByRole("button", { name: "룰렛 돌리고 저장하기" })
      .click();
    await page.getByRole("button", { name: "룰렛 닫기" }).click();

    const decisionPanel = page.getByLabel("저장된 오늘의 메뉴 선택");
    await expect(decisionPanel).toBeVisible();
    await expect(decisionPanel.getByRole("button")).toHaveCount(3);

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const panel = document.querySelector<HTMLElement>(".meal-decision");
      const actions = document.querySelector<HTMLElement>(
        ".meal-decision-actions",
      );

      if (!panel || !actions) {
        throw new Error("저장된 선택 UI의 layout box를 찾지 못했습니다.");
      }

      const panelBox = panel.getBoundingClientRect();
      const actionsBox = actions.getBoundingClientRect();

      return {
        overflow:
          Math.max(root.scrollWidth, document.body.scrollWidth) -
          root.clientWidth,
        actionsWithinPanel:
          actionsBox.left >= panelBox.left - 1 &&
          actionsBox.right <= panelBox.right + 1,
      };
    });

    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.actionsWithinPanel).toBe(true);
  });
}

test("공유 미지원 시 클립보드를 한 번만 시도하고 실패를 안내한다", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    let attempts = 0;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          attempts += 1;
          (window as Window & { __clipboardAttempts?: number }).__clipboardAttempts =
            attempts;
          throw new DOMException("denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "룰렛 열기" }).click();
  await page
    .getByRole("button", { name: "룰렛 돌리고 저장하기" })
    .click();
  await page.getByRole("button", { name: "룰렛 닫기" }).click();
  await page.getByRole("button", { name: "공유", exact: true }).click();

  await expect(page.getByRole("status")).toHaveText(
    "공유하지 못했어요. 잠시 후 다시 시도해주세요.",
  );
  expect(
    await page.evaluate(
      () => (window as Window & { __clipboardAttempts?: number }).__clipboardAttempts,
    ),
  ).toBe(1);
});

test("서울 자정이 지나면 날짜를 갱신하고 전날 선택을 만료한다", async ({
  page,
}) => {
  await page.clock.install({
    time: new Date("2026-08-13T23:59:59.500+09:00"),
  });
  await page.goto("/");

  await page.getByRole("button", { name: "룰렛 열기" }).click();
  await page
    .getByRole("button", { name: "룰렛 돌리고 저장하기" })
    .click();
  await page.getByRole("button", { name: "룰렛 닫기" }).click();
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toBeVisible();

  await page.clock.runFor(700);

  await expect(page.locator(".section-date")).toHaveText("8월 14일 금요일");
  await expect(page.getByLabel("저장된 오늘의 메뉴 선택")).toHaveCount(0);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), MEAL_DECISION_STORAGE_KEY),
  ).toBeNull();
});

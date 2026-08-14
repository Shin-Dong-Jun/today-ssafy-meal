import { describe, expect, it } from "vitest";

import { e2eSampleMeal } from "../data/fixtures/e2eSampleMeal";
import { e2eUnverifiedMeal } from "../data/fixtures/e2eUnverifiedMeal";
import { e2eVerifiedMeal } from "../data/fixtures/e2eVerifiedMeal";
import type { WeeklyMeal } from "../data/meals";
import { buildWeekdayMealSlots } from "../utils/date";
import { buildMealNavigatorModel } from "./mealNavigatorModel";

function buildModel(
  mealData: WeeklyMeal,
  weekStatus: "CURRENT" | "PAST" | "FUTURE",
) {
  return buildMealNavigatorModel(
    mealData,
    weekStatus,
    buildWeekdayMealSlots(mealData),
  );
}

describe("buildMealNavigatorModel", () => {
  it("날짜 미확인 식단은 안내와 사진 순서 target만 만든다", () => {
    const model = buildModel(e2eUnverifiedMeal, "CURRENT");

    expect(model.ariaLabel).toBe("사진 순서 바로가기");
    expect(model.items.map(({ targetId, label }) => ({ targetId, label }))).toEqual([
      { targetId: "meal-data-notice", label: "안내" },
      { targetId: "meal-slot-1", label: "식단 1" },
      { targetId: "meal-slot-2", label: "식단 2" },
      { targetId: "meal-slot-3", label: "식단 3" },
      { targetId: "meal-slot-4", label: "식단 4" },
      { targetId: "meal-slot-5", label: "식단 5" },
    ]);
  });

  it("샘플 식단은 실제 식단과 구분되는 이름과 target을 만든다", () => {
    const model = buildModel(e2eSampleMeal, "CURRENT");

    expect(model.ariaLabel).toBe("예시 식단 바로가기");
    expect(model.items.map(({ targetId, label }) => ({ targetId, label }))).toEqual([
      { targetId: "meal-data-notice", label: "예시 안내" },
      { targetId: "meal-slot-1", label: "예시 1" },
      { targetId: "meal-slot-2", label: "예시 2" },
      { targetId: "meal-slot-3", label: "예시 3" },
      { targetId: "meal-slot-4", label: "예시 4" },
      { targetId: "meal-slot-5", label: "예시 5" },
    ]);
  });

  it("날짜 확인 식단은 오늘과 월~금 날짜 target을 만든다", () => {
    const model = buildModel(e2eVerifiedMeal, "CURRENT");

    expect(model.ariaLabel).toBe("식단 바로가기");
    expect(model.items).toEqual([
      { targetId: "today-section", label: "오늘" },
      {
        targetId: "meal-2026-08-10",
        label: "월",
        desktopLabel: "월 10",
        accessibleLabel: "8월 10일 월요일 식단",
      },
      {
        targetId: "meal-2026-08-11",
        label: "화",
        desktopLabel: "화 11",
        accessibleLabel: "8월 11일 화요일 식단",
      },
      {
        targetId: "meal-2026-08-12",
        label: "수",
        desktopLabel: "수 12",
        accessibleLabel: "8월 12일 수요일 식단",
      },
      {
        targetId: "meal-2026-08-13",
        label: "목",
        desktopLabel: "목 13",
        accessibleLabel: "8월 13일 목요일 식단",
      },
      {
        targetId: "meal-2026-08-14",
        label: "금",
        desktopLabel: "금 14",
        accessibleLabel: "8월 14일 금요일 식단",
      },
    ]);
  });

  it("지난 날짜 확인 식단은 오늘 대신 안내로 시작한다", () => {
    const model = buildModel(e2eVerifiedMeal, "PAST");

    expect(model.ariaLabel).toBe("지난 식단 바로가기");
    expect(model.items[0]).toEqual({
      targetId: "meal-data-notice",
      label: "안내",
    });
  });

  it("예정 날짜 확인 식단은 접근 가능한 이름으로 상태를 구분한다", () => {
    const model = buildModel(e2eVerifiedMeal, "FUTURE");

    expect(model.ariaLabel).toBe("예정 식단 바로가기");
  });
});

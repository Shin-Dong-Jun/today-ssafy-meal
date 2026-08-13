import { describe, expect, it } from "vitest";
import { weeklyMeal } from "./meals";

describe("샘플 주간 식단 데이터", () => {
  it("월요일부터 금요일까지 날짜 중복 없이 5일을 제공한다", () => {
    expect(weeklyMeal.meals).toHaveLength(5);
    expect(new Set(weeklyMeal.meals.map((meal) => meal.date)).size).toBe(5);
    expect(weeklyMeal.meals.map((meal) => meal.dayOfWeek)).toEqual([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ]);
    expect(weeklyMeal.meals[0]?.date).toBe(weeklyMeal.weekStart);
  });

  it("사진에서 판독한 실제 데이터로 표시한다", () => {
    expect(weeklyMeal.isSample).toBe(false);
    expect(weeklyMeal.sourceNotes.length).toBeGreaterThan(0);
  });

  it("각 요일에 사진의 두 메뉴 블록을 분리해 제공한다", () => {
    expect(
      weeklyMeal.meals.every((meal) => meal.mealOptions.length === 2),
    ).toBe(true);
  });
});

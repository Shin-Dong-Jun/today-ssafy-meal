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

  it("실제 식단으로 오해되지 않도록 샘플로 표시한다", () => {
    expect(weeklyMeal.isSample).toBe(true);
  });
});

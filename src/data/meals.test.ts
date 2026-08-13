import { describe, expect, it } from "vitest";
import { e2eVerifiedMeal } from "./fixtures/e2eVerifiedMeal";
import { weeklyMeal } from "./meals";
import { validateWeeklyMeal } from "./validateWeeklyMeal";

describe("현재 주간 식단 데이터", () => {
  it("배포 가능한 주간 식단 invariant를 충족한다", () => {
    const result = validateWeeklyMeal(weeklyMeal);

    result.warnings.forEach(({ code, path, message }) => {
      console.warn(`[식단 데이터 경고:${code}] ${path} - ${message}`);
    });
    expect(result.errors).toEqual([]);
  });

  it("운영 데이터와 분리된 E2E fixture도 invariant를 충족한다", () => {
    expect(validateWeeklyMeal(e2eVerifiedMeal)).toEqual({
      errors: [],
      warnings: [],
    });
  });
});

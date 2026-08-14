import { describe, expect, it } from "vitest";
import { e2eSampleMeal } from "./fixtures/e2eSampleMeal";
import { e2eUnverifiedMeal } from "./fixtures/e2eUnverifiedMeal";
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

  it.each([
    ["날짜 확인", e2eVerifiedMeal],
    ["날짜 미확인", e2eUnverifiedMeal],
    ["샘플", e2eSampleMeal],
  ])("운영 데이터와 분리된 %s E2E fixture도 invariant를 충족한다", (_, fixture) => {
    expect(validateWeeklyMeal(fixture)).toEqual({ errors: [], warnings: [] });
  });
});

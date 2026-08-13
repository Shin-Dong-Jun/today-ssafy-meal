import { describe, expect, it } from "vitest";
import type { DayOfWeek, WeeklyMeal } from "./meals";
import { validateWeeklyMeal } from "./validateWeeklyMeal";

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

function createValidWeeklyMeal(): WeeklyMeal {
  return {
    weekStart: "2026-08-31",
    updatedAt: "2026-08-28T15:30:00+09:00",
    isSample: true,
    sourceNotes: [],
    meals: WEEKDAYS.map((dayOfWeek, index) => {
      const date = new Date(Date.UTC(2026, 7, 31 + index))
        .toISOString()
        .slice(0, 10);

      return {
        date,
        dayOfWeek,
        mealOptions: [
          { label: "메뉴 1", menuItems: [`메뉴 1-${index}`] },
          { label: "메뉴 2", menuItems: [`메뉴 2-${index}`] },
        ],
        uncertainTexts: [],
      };
    }),
  };
}

const errorCodes = (weekly: WeeklyMeal) =>
  validateWeeklyMeal(weekly).errors.map(({ code }) => code);

describe("주간 식단 invariant 검증", () => {
  it("월말을 넘는 정상적인 월~금 식단을 허용한다", () => {
    const result = validateWeeklyMeal(createValidWeeklyMeal());

    expect(result).toEqual({ errors: [], warnings: [] });
  });

  it("존재하지 않는 날짜와 월요일이 아닌 weekStart를 거부한다", () => {
    const invalidDate = createValidWeeklyMeal();
    invalidDate.weekStart = "2026-02-30";

    const tuesdayStart = createValidWeeklyMeal();
    tuesdayStart.weekStart = "2026-09-01";

    expect(errorCodes(invalidDate)).toContain("INVALID_WEEK_START");
    expect(errorCodes(tuesdayStart)).toContain("WEEK_START_NOT_MONDAY");
  });

  it("timezone이 포함된 ISO 시각을 허용하고 잘못된 시각을 거부한다", () => {
    const minutePrecision = createValidWeeklyMeal();
    minutePrecision.updatedAt = "2026-08-28T15:30+09:00";

    const missingTimezone = createValidWeeklyMeal();
    missingTimezone.updatedAt = "2026-08-28T15:30:00";

    const invalidTime = createValidWeeklyMeal();
    invalidTime.updatedAt = "2026-08-28T25:30:00+09:00";

    expect(errorCodes(minutePrecision)).toEqual([]);
    expect(errorCodes(missingTimezone)).toContain("INVALID_UPDATED_AT");
    expect(errorCodes(invalidTime)).toContain("INVALID_UPDATED_AT");
  });

  it("잘못된 식단 날짜와 공백 label·menu item을 거부한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].date = "2026-8-31";
    weekly.meals[0].mealOptions[0] = {
      label: " ",
      menuItems: [" "],
    };

    const codes = errorCodes(weekly);

    expect(codes).toContain("INVALID_MEAL_DATE");
    expect(codes).toContain("INVALID_OPTION_LABEL");
    expect(codes).toContain("INVALID_TEXT");
  });

  it("누락·중복·순서가 틀린 식단 날짜를 모두 보고한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals.splice(1, 1);
    weekly.meals[1].date = weekly.meals[0].date;

    const codes = errorCodes(weekly);

    expect(codes).toContain("INVALID_MEAL_COUNT");
    expect(codes).toContain("DUPLICATE_MEAL_DATE");
    expect(codes).toContain("MEAL_DATE_SEQUENCE_MISMATCH");
  });

  it("날짜 순서와 일치하지 않는 요일을 거부한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[2].dayOfWeek = "THURSDAY";

    expect(errorCodes(weekly)).toContain("DAY_OF_WEEK_MISMATCH");
  });

  it("비어 있거나 중복된 메뉴 내용을 거부한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.sourceNotes = [" "];
    weekly.meals[0].mealOptions = [
      { label: "메뉴", menuItems: ["김치", "김치"] },
      { label: "메뉴", menuItems: [] },
    ];

    const codes = errorCodes(weekly);

    expect(codes).toContain("INVALID_TEXT");
    expect(codes).toContain("DUPLICATE_OPTION_LABEL");
    expect(codes).toContain("DUPLICATE_MENU_ITEM");
    expect(codes).toContain("EMPTY_MENU_ITEMS");
  });

  it("서울 이외 offset과 두 개가 아닌 메뉴 option은 warning으로 분리한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.updatedAt = "2026-08-28T06:30:00Z";
    weekly.meals[0].mealOptions = [];

    const result = validateWeeklyMeal(weekly);

    expect(result.errors).toEqual([]);
    expect(result.warnings.map(({ code }) => code)).toEqual([
      "NON_SEOUL_OFFSET",
      "UNEXPECTED_OPTION_COUNT",
    ]);
  });

  it("서로 다른 option 사이의 같은 메뉴명은 허용한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].mealOptions = [
      { label: "메뉴 1", menuItems: ["포기김치"] },
      { label: "메뉴 2", menuItems: ["포기김치"] },
    ];

    expect(errorCodes(weekly)).toEqual([]);
  });

  it("허용 범위를 벗어난 timezone offset을 거부한다", () => {
    const invalidHourBoundary = createValidWeeklyMeal();
    invalidHourBoundary.updatedAt = "2026-08-28T15:30:00+14:01";

    const invalidMinute = createValidWeeklyMeal();
    invalidMinute.updatedAt = "2026-08-28T15:30:00+09:60";

    expect(errorCodes(invalidHourBoundary)).toContain("INVALID_UPDATED_AT");
    expect(errorCodes(invalidMinute)).toContain("INVALID_UPDATED_AT");
  });
});

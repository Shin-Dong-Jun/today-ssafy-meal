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
    status: "SAMPLE",
    sourceNotes: [],
    meals: WEEKDAYS.map((dayOfWeek, index) => {
      const date = new Date(Date.UTC(2026, 7, 31 + index))
        .toISOString()
        .slice(0, 10);

      return {
        date,
        dayOfWeek,
        mealOptions: [
          {
            label: "메뉴 1",
            menuItems: [`메뉴 1-${index}`],
            representativeMenuItem: `메뉴 1-${index}`,
          },
          {
            label: "메뉴 2",
            menuItems: [`메뉴 2-${index}`],
            representativeMenuItem: null,
          },
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
      representativeMenuItem: null,
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
      {
        label: "메뉴",
        menuItems: ["김치", "김치"],
        representativeMenuItem: "김치",
      },
      { label: "메뉴", menuItems: [], representativeMenuItem: null },
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

  it("날짜 미확인 식단에는 근거와 한계를 sourceNotes에 남긴다", () => {
    const missingSourceNotes = createValidWeeklyMeal();
    missingSourceNotes.status = "DATE_UNVERIFIED";
    missingSourceNotes.sourceNotes = [];

    const unverifiedDateMeal = createValidWeeklyMeal();
    unverifiedDateMeal.status = "DATE_UNVERIFIED";
    unverifiedDateMeal.sourceNotes = [
      "확인 가능한 메뉴만 옮겼지만 날짜는 확인하지 못했습니다.",
    ];

    expect(errorCodes(missingSourceNotes)).toContain(
      "UNVERIFIED_DATE_REQUIRES_SOURCE_NOTES",
    );
    expect(errorCodes(unverifiedDateMeal)).toEqual([]);
  });

  it("서로 다른 option 사이의 같은 메뉴명은 허용한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].mealOptions = [
      {
        label: "메뉴 1",
        menuItems: ["포기김치"],
        representativeMenuItem: "포기김치",
      },
      {
        label: "메뉴 2",
        menuItems: ["포기김치"],
        representativeMenuItem: "포기김치",
      },
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

  it("대표 음식은 null이거나 같은 option의 정확한 메뉴명이면 허용한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].mealOptions[0].representativeMenuItem = "메뉴 1-0";
    weekly.meals[0].mealOptions[1].representativeMenuItem = null;

    expect(errorCodes(weekly)).toEqual([]);
  });

  it.each(["", " ", "대표 음식 "])(
    "비어 있거나 앞뒤 공백이 있는 대표 음식 '%s'을 거부한다",
    (representativeMenuItem) => {
      const weekly = createValidWeeklyMeal();
      weekly.meals[0].mealOptions[0].representativeMenuItem =
        representativeMenuItem;

      expect(errorCodes(weekly)).toContain(
        "INVALID_REPRESENTATIVE_MENU_ITEM",
      );
    },
  );

  it("다른 option에만 존재하는 메뉴는 대표 음식으로 허용하지 않는다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].mealOptions[0].representativeMenuItem = "메뉴 2-0";

    expect(errorCodes(weekly)).toContain(
      "REPRESENTATIVE_MENU_ITEM_NOT_FOUND",
    );
  });

  it("메뉴명 변경 후 남은 stale 대표 음식 값을 거부한다", () => {
    const weekly = createValidWeeklyMeal();
    weekly.meals[0].mealOptions[0].menuItems = ["변경된 메뉴"];

    expect(errorCodes(weekly)).toContain(
      "REPRESENTATIVE_MENU_ITEM_NOT_FOUND",
    );
  });
});

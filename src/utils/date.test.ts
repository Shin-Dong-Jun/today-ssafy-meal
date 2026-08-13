import { describe, expect, it } from "vitest";
import type { WeeklyMeal } from "../data/meals";
import {
  buildWeekdayMealSlots,
  formatMealDate,
  getSeoulDateKey,
  isSeoulWeekend,
} from "./date";

describe("서울 시간대 날짜 처리", () => {
  it("UTC 날짜가 전날이어도 서울 기준 날짜 키를 반환한다", () => {
    const lateNightUtc = new Date("2026-08-12T15:30:00.000Z");

    expect(getSeoulDateKey(lateNightUtc)).toBe("2026-08-13");
  });

  it("서울 자정 경계 전후의 날짜가 하루 차이 난다", () => {
    expect(getSeoulDateKey(new Date("2026-08-16T14:59:59.000Z"))).toBe(
      "2026-08-16",
    );
    expect(getSeoulDateKey(new Date("2026-08-16T15:00:00.000Z"))).toBe(
      "2026-08-17",
    );
  });

  it("서울 기준 주말을 판별한다", () => {
    expect(isSeoulWeekend(new Date("2026-08-14T16:00:00.000Z"))).toBe(true);
    expect(isSeoulWeekend(new Date("2026-08-16T00:00:00+09:00"))).toBe(true);
    expect(isSeoulWeekend(new Date("2026-08-17T00:00:00+09:00"))).toBe(false);
  });

  it("식단 날짜를 한국어로 표시한다", () => {
    expect(formatMealDate("2026-08-17", "MONDAY")).toBe(
      "8월 17일 월요일",
    );
  });

  it("누락된 요일을 빈 식단 슬롯으로 채운다", () => {
    const weekly: WeeklyMeal = {
      weekStart: "2026-08-17",
      updatedAt: "2026-08-17T09:00:00+09:00",
      isSample: true,
      sourceNotes: [],
      meals: [
        {
          date: "2026-08-17",
          dayOfWeek: "MONDAY",
          mealOptions: [{ label: "메뉴 1", menuItems: ["쌀밥"] }],
          uncertainTexts: [],
        },
      ],
    };

    const slots = buildWeekdayMealSlots(weekly);

    expect(slots).toHaveLength(5);
    expect(slots[1]).toEqual({
      date: "2026-08-18",
      dayOfWeek: "TUESDAY",
      mealOptions: [],
      uncertainTexts: [],
    });
    expect(slots[4]?.date).toBe("2026-08-21");
  });
});

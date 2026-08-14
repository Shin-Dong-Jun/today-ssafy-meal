import { describe, expect, it } from "vitest";
import type { WeeklyMeal } from "../data/meals";
import {
  buildWeekdayMealSlots,
  formatMealWeekRange,
  formatUpdatedAt,
  formatUpdatedAtCompact,
  getMillisecondsUntilNextSeoulDay,
  getMealWeekStatus,
  formatMealDate,
  getSeoulDateKey,
  getSeoulWeekStartKey,
  isSeoulWeekend,
  normalizeKoreanDayPeriod,
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

  it("서울 자정까지 남은 시간을 경계에서 정확히 계산한다", () => {
    expect(
      getMillisecondsUntilNextSeoulDay(
        new Date("2026-08-16T23:59:59.500+09:00"),
      ),
    ).toBe(500);
    expect(
      getMillisecondsUntilNextSeoulDay(
        new Date("2026-08-17T00:00:00.000+09:00"),
      ),
    ).toBe(24 * 60 * 60 * 1000);
  });

  it("서울 기준 주말을 판별한다", () => {
    expect(isSeoulWeekend(new Date("2026-08-14T16:00:00.000Z"))).toBe(true);
    expect(isSeoulWeekend(new Date("2026-08-16T00:00:00+09:00"))).toBe(true);
    expect(isSeoulWeekend(new Date("2026-08-17T00:00:00+09:00"))).toBe(false);
  });

  it("서울 날짜의 월요일을 현재 주 시작일로 계산한다", () => {
    expect(getSeoulWeekStartKey(new Date("2026-08-13T12:00:00+09:00"))).toBe(
      "2026-08-10",
    );
    expect(getSeoulWeekStartKey(new Date("2026-08-16T23:59:59+09:00"))).toBe(
      "2026-08-10",
    );
    expect(getSeoulWeekStartKey(new Date("2026-08-17T00:00:00+09:00"))).toBe(
      "2026-08-17",
    );
  });

  it("등록된 식단이 현재 주보다 이전인지 이후인지 판별한다", () => {
    const currentDate = new Date("2026-08-13T12:00:00+09:00");

    expect(getMealWeekStatus("2026-08-10", currentDate)).toBe("CURRENT");
    expect(getMealWeekStatus("2026-08-03", currentDate)).toBe("PAST");
    expect(getMealWeekStatus("2026-08-17", currentDate)).toBe("FUTURE");
  });

  it("식단 날짜를 한국어로 표시한다", () => {
    expect(formatMealDate("2026-08-17", "MONDAY")).toBe(
      "8월 17일 월요일",
    );
  });

  it("업데이트 시각과 식단 주간 범위를 간결하게 표시한다", () => {
    expect(
      formatUpdatedAtCompact(
        "2026-08-13T11:57:00+09:00",
        new Date("2026-08-13T18:00:00+09:00"),
      ),
    ).toBe("오늘 오전 11:57");
    expect(
      formatUpdatedAtCompact(
        "2026-08-13T21:07:00+09:00",
        new Date("2026-08-13T22:00:00+09:00"),
      ),
    ).toBe("오늘 오후 9:07");
    expect(formatUpdatedAt("2026-08-13T21:07:00+09:00")).toBe(
      "2026년 8월 13일 오후 9:07",
    );
    expect(
      formatUpdatedAtCompact(
        "2026-08-13T00:05:00+09:00",
        new Date("2026-08-13T22:00:00+09:00"),
      ),
    ).toBe("오늘 오전 12:05");
    expect(
      formatUpdatedAtCompact(
        "2026-08-13T12:05:00+09:00",
        new Date("2026-08-13T22:00:00+09:00"),
      ),
    ).toBe("오늘 오후 12:05");
    expect(formatMealWeekRange("2026-08-31")).toBe(
      "8월 31일~9월 4일",
    );
  });

  it.each([
    ["AM", "오전"],
    ["A.M.", "오전"],
    ["PM", "오후"],
    ["P.M.", "오후"],
    ["오전", "오전"],
    ["오후", "오후"],
  ])("dayPeriod %s를 한국어로 정규화한다", (dayPeriod, expected) => {
    expect(normalizeKoreanDayPeriod(dayPeriod)).toBe(expected);
  });

  it("누락된 요일을 빈 식단 슬롯으로 채운다", () => {
    const weekly: WeeklyMeal = {
      weekStart: "2026-08-17",
      updatedAt: "2026-08-17T09:00:00+09:00",
      status: "SAMPLE",
      sourceNotes: [],
      meals: [
        {
          date: "2026-08-17",
          dayOfWeek: "MONDAY",
          mealOptions: [
            {
              label: "메뉴 1",
              menuItems: ["쌀밥"],
              representativeMenuItem: null,
            },
          ],
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

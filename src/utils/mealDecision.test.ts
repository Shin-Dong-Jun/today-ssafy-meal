import { describe, expect, it } from "vitest";

import type { DailyMeal } from "../data/meals";
import {
  buildMealDecisionShareText,
  createMealDecision,
  parseMealDecision,
} from "./mealDecision";

const DATA_UPDATED_AT = "2026-08-13T11:57:57+09:00";
const TODAY_KEY = "2026-08-13";

const meal: DailyMeal = {
  date: TODAY_KEY,
  dayOfWeek: "THURSDAY",
  mealOptions: [
    {
      label: "메뉴 1 · 사진 상단",
      menuItems: ["흰쌀밥", "계란말이"],
      representativeMenuItem: null,
    },
    {
      label: "메뉴 2 · 사진 하단",
      menuItems: ["콩나물국", "춘권튀김"],
      representativeMenuItem: null,
    },
  ],
  uncertainTexts: [],
};

describe("식단 선택 저장 데이터", () => {
  it("현재 메뉴 선택을 version 1 저장 데이터로 만든다", () => {
    expect(createMealDecision(meal, 1, DATA_UPDATED_AT)).toEqual({
      version: 1,
      mealDate: TODAY_KEY,
      optionIndex: 1,
      optionLabel: "메뉴 2 · 사진 하단",
      dataUpdatedAt: DATA_UPDATED_AT,
    });
  });

  it.each([-1, 0.5, 2, Number.NaN])(
    "유효하지 않은 선택지 index %s는 저장하지 않는다",
    (optionIndex) => {
      expect(createMealDecision(meal, optionIndex, DATA_UPDATED_AT)).toBeNull();
    },
  );

  it("유효하고 현재 데이터와 일치하는 저장값을 복원한다", () => {
    const decision = createMealDecision(meal, 0, DATA_UPDATED_AT);

    expect(
      parseMealDecision(
        JSON.stringify(decision),
        meal,
        TODAY_KEY,
        DATA_UPDATED_AT,
      ),
    ).toEqual(decision);
  });

  it.each([null, undefined, "", "{broken", "null", "[]"])(
    "JSON 객체가 아닌 값 %s는 복원하지 않는다",
    (raw) => {
      expect(
        parseMealDecision(raw, meal, TODAY_KEY, DATA_UPDATED_AT),
      ).toBeNull();
    },
  );

  it("저장 버전이 다르면 복원하지 않는다", () => {
    const raw = JSON.stringify({
      ...createMealDecision(meal, 0, DATA_UPDATED_AT),
      version: 2,
    });

    expect(
      parseMealDecision(raw, meal, TODAY_KEY, DATA_UPDATED_AT),
    ).toBeNull();
  });

  it("서울 기준 오늘 날짜 또는 현재 식단 날짜와 다르면 복원하지 않는다", () => {
    const raw = JSON.stringify(
      createMealDecision(meal, 0, DATA_UPDATED_AT),
    );

    expect(
      parseMealDecision(raw, meal, "2026-08-14", DATA_UPDATED_AT),
    ).toBeNull();
    expect(
      parseMealDecision(
        raw,
        { ...meal, date: "2026-08-12" },
        TODAY_KEY,
        DATA_UPDATED_AT,
      ),
    ).toBeNull();
    expect(
      parseMealDecision(raw, undefined, TODAY_KEY, DATA_UPDATED_AT),
    ).toBeNull();
  });

  it("식단 데이터가 갱신되면 이전 선택을 복원하지 않는다", () => {
    const raw = JSON.stringify(
      createMealDecision(meal, 0, DATA_UPDATED_AT),
    );

    expect(
      parseMealDecision(
        raw,
        meal,
        TODAY_KEY,
        "2026-08-13T13:00:00+09:00",
      ),
    ).toBeNull();
  });

  it.each([
    { optionIndex: -1 },
    { optionIndex: 2 },
    { optionIndex: 0.5 },
    { optionIndex: "0" },
    { optionLabel: "바뀐 메뉴명" },
  ])("선택지 index 또는 label이 맞지 않으면 복원하지 않는다", (patch) => {
    const raw = JSON.stringify({
      ...createMealDecision(meal, 0, DATA_UPDATED_AT),
      ...patch,
    });

    expect(
      parseMealDecision(raw, meal, TODAY_KEY, DATA_UPDATED_AT),
    ).toBeNull();
  });

  it("필수 필드의 타입이 다르면 복원하지 않는다", () => {
    const raw = JSON.stringify({
      version: 1,
      mealDate: TODAY_KEY,
      optionIndex: 0,
      optionLabel: null,
      dataUpdatedAt: DATA_UPDATED_AT,
    });

    expect(
      parseMealDecision(raw, meal, TODAY_KEY, DATA_UPDATED_AT),
    ).toBeNull();
  });
});

describe("식단 선택 공유 문구", () => {
  it("선택한 날짜, A/B 표기와 실제 메뉴만 포함한다", () => {
    expect(buildMealDecisionShareText(meal, 1)).toBe(
      [
        "오늘 싸피밥 · 8월 13일",
        "메뉴 B",
        "콩나물국, 춘권튀김",
        "#오늘싸피밥",
      ].join("\n"),
    );
    expect(buildMealDecisionShareText(meal, 1)).not.toContain("계란말이");
    expect(buildMealDecisionShareText(meal, 1)).not.toContain("사진 하단");
  });

  it("존재하지 않는 선택지는 공유하지 않는다", () => {
    expect(() => buildMealDecisionShareText(meal, 2)).toThrow(RangeError);
  });
});

import { describe, expect, it } from "vitest";

import { pickMealOptionIndex } from "./pickMealOption";

describe("메뉴 선택 도우미", () => {
  it("선택지가 없으면 결과를 만들지 않는다", () => {
    expect(pickMealOptionIndex(0, 0.5)).toBeNull();
  });

  it("선택지가 하나면 유일한 메뉴를 고른다", () => {
    expect(pickMealOptionIndex(1, 0.8)).toBe(0);
  });

  it("난수 값에 따라 메뉴를 고른다", () => {
    expect(pickMealOptionIndex(2, 0)).toBe(0);
    expect(pickMealOptionIndex(2, 0.999)).toBe(1);
  });

  it("다시 고를 때 직전 메뉴는 제외한다", () => {
    expect(pickMealOptionIndex(2, 0, 0)).toBe(1);
    expect(pickMealOptionIndex(3, 0, 1)).toBe(0);
    expect(pickMealOptionIndex(3, 0.999, 1)).toBe(2);
  });

  it("유효하지 않은 직전 선택값은 무시한다", () => {
    expect(pickMealOptionIndex(2, 0.999, -1)).toBe(1);
    expect(pickMealOptionIndex(2, 0, 2)).toBe(0);
  });

  it("잘못된 메뉴 개수와 난수 값은 거부한다", () => {
    expect(() => pickMealOptionIndex(-1, 0.5)).toThrow(RangeError);
    expect(() => pickMealOptionIndex(1.5, 0.5)).toThrow(RangeError);
    expect(() => pickMealOptionIndex(2, -1)).toThrow(RangeError);
    expect(() => pickMealOptionIndex(2, 1)).toThrow(RangeError);
    expect(() => pickMealOptionIndex(2, Number.NaN)).toThrow(RangeError);
  });
});

import { describe, expect, it } from "vitest";

import {
  createMealRouletteOdds,
  getMealRouletteLandingRotation,
  pickMealRouletteOption,
} from "./pickMealOption";

describe("A/B 메뉴 룰렛", () => {
  it("한쪽 메뉴에 최소 55%의 확률을 주도록 만든다", () => {
    expect(createMealRouletteOdds(0)).toEqual({ optionA: 35, optionB: 65 });
    expect(createMealRouletteOdds(10.5 / 22)).toEqual({
      optionA: 45,
      optionB: 55,
    });
    expect(createMealRouletteOdds(0.5)).toEqual({ optionA: 55, optionB: 45 });
    expect(createMealRouletteOdds(1 - Number.EPSILON)).toEqual({
      optionA: 65,
      optionB: 35,
    });
  });

  it("가능한 확률 전체의 평균은 A와 B가 같다", () => {
    const optionAOdds = Array.from({ length: 22 }, (_, index) =>
      createMealRouletteOdds((index + 0.5) / 22).optionA,
    );
    const average = optionAOdds.reduce((sum, odds) => sum + odds, 0) / 22;

    expect(optionAOdds).toEqual([
      35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 55, 56, 57, 58, 59, 60,
      61, 62, 63, 64, 65,
    ]);
    expect(average).toBe(50);
  });

  it("표시된 가중치에 따라 메뉴를 선택한다", () => {
    const odds = { optionA: 40, optionB: 60 };

    expect(pickMealRouletteOption(odds, 0.3999)).toBe(0);
    expect(pickMealRouletteOption(odds, 0.4)).toBe(1);
  });

  it("선택된 메뉴 구간의 중앙을 포인터에 맞춘다", () => {
    const odds = { optionA: 50, optionB: 50 };

    expect(getMealRouletteLandingRotation(0, odds, 0.5, 0)).toBe(2070);
    expect(getMealRouletteLandingRotation(1, odds, 0.5, 0)).toBe(1890);
  });

  it("착지 지점이 선택된 확률 구간의 경계와 겹치지 않는다", () => {
    const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

    for (const optionA of [35, 45, 55, 65]) {
      const odds = { optionA, optionB: 100 - optionA };
      const optionAAngle = optionA * 3.6;

      for (const selectedOptionIndex of [0, 1] as const) {
        const segmentStart = selectedOptionIndex === 0 ? 0 : optionAAngle;
        const segmentSize =
          selectedOptionIndex === 0 ? optionAAngle : 360 - optionAAngle;

        for (const landingRandomValue of [0, 0.5, 1 - Number.EPSILON]) {
          const currentRotation = 731;
          const rotation = getMealRouletteLandingRotation(
            selectedOptionIndex,
            odds,
            landingRandomValue,
            currentRotation,
          );
          const sourceAngleAtPointer = normalizeAngle(-rotation);

          expect(rotation).toBeGreaterThanOrEqual(
            currentRotation + 5 * 360,
          );
          expect(rotation).toBeLessThan(currentRotation + 6 * 360);
          expect(sourceAngleAtPointer).toBeGreaterThanOrEqual(
            segmentStart + segmentSize * 0.18 - 1e-8,
          );
          expect(sourceAngleAtPointer).toBeLessThanOrEqual(
            segmentStart + segmentSize * 0.82 + 1e-8,
          );
        }
      }
    }
  });

  it("잘못된 난수와 확률은 거부한다", () => {
    expect(() => createMealRouletteOdds(-1)).toThrow(RangeError);
    expect(() => createMealRouletteOdds(1)).toThrow(RangeError);
    expect(() =>
      pickMealRouletteOption({ optionA: 40, optionB: 40 }, 0.5),
    ).toThrow(RangeError);
    expect(() =>
      getMealRouletteLandingRotation(
        2 as 0,
        { optionA: 50, optionB: 50 },
        0.5,
        0,
      ),
    ).toThrow(RangeError);
  });
});

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

  it("제공된 사진의 화~금 중식 A/B와 월요일 미등록 상태를 유지한다", () => {
    const mondayMeal = weeklyMeal.meals.find(
      ({ date }) => date === "2026-08-17",
    );

    expect(weeklyMeal).toMatchObject({
      weekStart: "2026-08-17",
      status: "DATE_VERIFIED",
    });
    expect(mondayMeal?.mealOptions).toEqual([]);
    expect(
      weeklyMeal.meals.slice(1).map(({ date, dayOfWeek, mealOptions }) => ({
        date,
        dayOfWeek,
        mealOptions,
      })),
    ).toEqual([
      {
        date: "2026-08-18",
        dayOfWeek: "TUESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "바지락된장국",
              "돈육고추장볶음",
              "어묵깻잎전",
              "청포묵무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "(뚝)날치알밥",
              "덴가스국",
              "라구파스타",
              "고구마샐러드",
              "오이피클",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-19",
        dayOfWeek: "WEDNESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(뚝)설렁탕",
              "오징어숙회무침",
              "생선커틀렛",
              "파래무침",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "베이컨갈릭볶음밥",
              "꼬치어묵국",
              "식빵피자토스트",
              "연두부찜",
              "실곤약초장무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-20",
        dayOfWeek: "THURSDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "제주식고사리해장국",
              "너비아니구이",
              "메추리알맵조림",
              "느타리버섯볶음",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "중화덮밥&후라이",
              "계란국",
              "자장라면",
              "느타리버섯볶음",
              "단무지",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-21",
        dayOfWeek: "FRIDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(뚝)얼큰만두전골",
              "두부탕수",
              "진미채채소무침",
              "오이탕탕이",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "잔치국수",
              "미니보쌈&무생채",
              "김가루양념밥",
              "오이탕탕이",
              "배추겉절이김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
    ]);
  });

  it.each([
    ["날짜 확인", e2eVerifiedMeal],
    ["날짜 미확인", e2eUnverifiedMeal],
    ["샘플", e2eSampleMeal],
  ])("운영 데이터와 분리된 %s E2E fixture도 invariant를 충족한다", (_, fixture) => {
    expect(validateWeeklyMeal(fixture)).toEqual({ errors: [], warnings: [] });
  });
});

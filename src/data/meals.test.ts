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

  it("제공된 사진의 월~금 중식 A/B를 정확한 순서로 유지한다", () => {
    expect(weeklyMeal).toMatchObject({
      weekStart: "2026-08-24",
      status: "DATE_VERIFIED",
    });
    expect(
      weeklyMeal.meals.map(({ date, dayOfWeek, mealOptions }) => ({
        date,
        dayOfWeek,
        mealOptions,
      })),
    ).toEqual([
      {
        date: "2026-08-24",
        dayOfWeek: "MONDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(겸)미역국밥",
              "완자전",
              "비빔칼국수",
              "호박볶음",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "파채칠리돈가스",
              "크림스프",
              "유부양념밥",
              "떡볶이&삶은계란",
              "단무지",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-25",
        dayOfWeek: "TUESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "콩나물국",
              "돈육김치볶음",
              "두부찜",
              "연근땅콩조림",
              "오이생채",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "마라마파덮밥",
              "콩나물국",
              "고로케사라다모닝빵",
              "닭가슴살겨자냉채",
              "짜사이채무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-26",
        dayOfWeek: "WEDNESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(겸)순살감자탕",
              "떡갈비조림",
              "버섯탕수",
              "오이고추쌈장무침",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "훈제오리묵은지볶음밥",
              "(국)도토리묵밥",
              "계란찜",
              "명엽채조림",
              "오이고추쌈장무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-27",
        dayOfWeek: "THURSDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "다슬기된장국",
              "꽁치캔김치찜",
              "김쌈밥&참치소스",
              "숙주나물",
              "열무김치",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "돈부리덮밥",
              "얼큰계란국",
              "오꼬노미야끼",
              "맛살콘샐러드",
              "숙주나물",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-08-28",
        dayOfWeek: "FRIDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(뚝)육개장",
              "옛날소시지전",
              "감자조림",
              "미역줄기볶음",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "냉메밀소바",
              "멸추양념밥",
              "새우튀김또띠아",
              "갈비만두찜",
              "쌈무김치",
              "포기김치",
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

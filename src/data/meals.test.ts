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
      weekStart: "2026-08-31",
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
        date: "2026-08-31",
        dayOfWeek: "MONDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(겸)닭곰탕",
              "언양식너비아니구이",
              "버섯잡채",
              "깐마늘무침",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "고깃집볶음밥&계란후라이",
              "시금치된장국",
              "감자크로켓",
              "단호박조림",
              "깐마늘무침",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-09-01",
        dayOfWeek: "TUESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "물만두국",
              "돈육버섯볶음",
              "어묵볶음",
              "브로콜리숙회",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "소세지카레라이스",
              "계란국",
              "춘권튀김",
              "브로콜리숙회",
              "락교&산고추",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-09-02",
        dayOfWeek: "WEDNESDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(겸)짬뽕밥",
              "돈육강정",
              "양장피무침",
              "콩나물무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "치즈함박스테이크&해쉬브라운튀김",
              "참치마요양념밥",
              "덴가스국",
              "푸실리샐러드",
              "오이피클",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-09-03",
        dayOfWeek: "THURSDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(뚝)우거지해장국",
              "잡채어묵볶음",
              "건파래볶음",
              "진미채채소무침",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "치킨마요덮밥",
              "콩나물매운국",
              "고구마떡맛탕",
              "연두부찜",
              "단무지무침",
              "포기김치",
            ],
            representativeMenuItem: null,
          },
        ],
      },
      {
        date: "2026-09-04",
        dayOfWeek: "FRIDAY",
        mealOptions: [
          {
            label: "중식 A",
            menuItems: [
              "잡곡밥",
              "(뚝)콩나물국밥",
              "백순대볶음",
              "김치전",
              "부추생채",
              "깍두기",
            ],
            representativeMenuItem: null,
          },
          {
            label: "중식 B",
            menuItems: [
              "열무물국수",
              "멸치육수",
              "후리카케밥",
              "설탕핫도그",
              "계란찜",
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

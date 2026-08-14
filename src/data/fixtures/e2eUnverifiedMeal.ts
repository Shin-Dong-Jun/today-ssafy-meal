import type { WeeklyMeal } from "../meals";
import { e2eVerifiedMeal } from "./e2eVerifiedMeal";

export const e2eUnverifiedMeal: WeeklyMeal = {
  ...e2eVerifiedMeal,
  status: "DATE_UNVERIFIED",
  sourceNotes: [
    "테스트 식단표에서 날짜 머리글을 확인할 수 없어 사진 순서만 검증합니다.",
    "테스트 식단표의 코너명이 잘려 있어 메뉴 1과 메뉴 2로 표시합니다.",
  ],
  meals: e2eVerifiedMeal.meals.map((meal, index) => ({
    ...meal,
    uncertainTexts: [
      `테스트 식단 ${index + 1}의 한 항목은 글자가 흐려 확실하지 않습니다.`,
    ],
  })),
};

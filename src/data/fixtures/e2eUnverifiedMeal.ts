import type { WeeklyMeal } from "../meals";
import { e2eVerifiedMeal } from "./e2eVerifiedMeal";

export const e2eUnverifiedMeal: WeeklyMeal = {
  ...e2eVerifiedMeal,
  status: "DATE_UNVERIFIED",
  sourceNotes: [
    "테스트 식단표의 월요일부터 금요일까지 열 순서는 확인했지만 실제 날짜 숫자는 확인하지 못했습니다.",
    "테스트 식단표의 코너명이 잘려 있어 메뉴 1과 메뉴 2로 표시합니다.",
  ],
  meals: e2eVerifiedMeal.meals.map((meal, index) => ({
    ...meal,
    uncertainTexts: [
      `테스트 식단 ${index + 1}의 한 항목은 글자가 흐려 확실하지 않습니다.`,
    ],
  })),
};

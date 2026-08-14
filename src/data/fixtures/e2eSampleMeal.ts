import type { WeeklyMeal } from "../meals";
import { e2eUnverifiedMeal } from "./e2eUnverifiedMeal";

export const e2eSampleMeal: WeeklyMeal = {
  ...e2eUnverifiedMeal,
  status: "SAMPLE",
  sourceNotes: ["상태별 화면 검증을 위한 테스트 전용 예시 데이터입니다."],
};

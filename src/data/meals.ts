export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export interface DailyMeal {
  /** Asia/Seoul 기준 YYYY-MM-DD */
  date: string;
  dayOfWeek: DayOfWeek;
  menuItems: string[];
  /** 식단표 사진에서 확실하게 읽지 못한 원문이나 설명 */
  uncertainTexts: string[];
}

export interface WeeklyMeal {
  /** 해당 주 월요일, Asia/Seoul 기준 YYYY-MM-DD */
  weekStart: string;
  /** ISO 8601 형식. 대한민국 시각은 +09:00 오프셋을 권장 */
  updatedAt: string;
  isSample: boolean;
  meals: DailyMeal[];
}

/**
 * 화면 확인을 위한 샘플 식단입니다.
 * 실제 식단표 사진을 반영할 때 모든 값을 교체하고 isSample을 false로 바꿉니다.
 */
export const weeklyMeal: WeeklyMeal = {
  weekStart: "2026-08-10",
  updatedAt: "2026-08-13T10:30:00+09:00",
  isSample: true,
  meals: [
    {
      date: "2026-08-10",
      dayOfWeek: "MONDAY",
      menuItems: [
        "현미밥",
        "미역국",
        "간장 닭갈비",
        "오이무침",
        "배추김치",
      ],
      uncertainTexts: [],
    },
    {
      date: "2026-08-11",
      dayOfWeek: "TUESDAY",
      menuItems: [
        "흑미밥",
        "콩나물국",
        "제육볶음",
        "양배추쌈",
        "깍두기",
      ],
      uncertainTexts: ["후식 종류는 샘플 판독 불확실 항목입니다."],
    },
    {
      date: "2026-08-12",
      dayOfWeek: "WEDNESDAY",
      menuItems: [
        "카레라이스",
        "두부 샐러드",
        "새우튀김",
        "단무지",
        "요거트",
      ],
      uncertainTexts: [],
    },
    {
      date: "2026-08-13",
      dayOfWeek: "THURSDAY",
      menuItems: [
        "기장밥",
        "된장국",
        "소고기 불고기",
        "계란말이",
        "부추무침",
        "배추김치",
      ],
      uncertainTexts: [],
    },
    {
      date: "2026-08-14",
      dayOfWeek: "FRIDAY",
      menuItems: [
        "김치볶음밥",
        "유부장국",
        "고등어구이",
        "콘치즈",
        "깍두기",
      ],
      uncertainTexts: [],
    },
  ],
};

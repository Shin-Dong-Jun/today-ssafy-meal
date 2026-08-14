import type { DayOfWeek, DailyMeal, WeeklyMeal } from "../meals";

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

export const E2E_VERIFIED_SOURCE_NOTE =
  "테스트용 내부 출처 메모는 사용자 화면에 표시하지 않습니다.";
export const E2E_VERIFIED_UNCERTAIN_TEXT =
  "테스트용 흐린 판독 메모는 사용자 화면에 표시하지 않습니다.";

const createFixtureMeal = (
  date: string,
  dayOfWeek: DayOfWeek,
): DailyMeal => ({
  date,
  dayOfWeek,
  mealOptions: [
    {
      label: "메뉴 1 · 테스트 A",
      menuItems: [`${dayOfWeek} 테스트 메뉴 A`],
      representativeMenuItem: null,
    },
    {
      label: "메뉴 2 · 테스트 B",
      menuItems: [`${dayOfWeek} 테스트 메뉴 B`],
      representativeMenuItem: null,
    },
  ],
  uncertainTexts: [],
});

const meals = WEEKDAYS.map((dayOfWeek, index) =>
  createFixtureMeal(`2026-08-${String(10 + index).padStart(2, "0")}`, dayOfWeek),
);

meals[3] = {
  date: "2026-08-13",
  dayOfWeek: "THURSDAY",
  mealOptions: [
    {
      label: "메뉴 1 · 사진 상단",
      menuItems: ["흰쌀밥", "계란말이", "오징어실채볶음", "깍두기"],
      representativeMenuItem: "계란말이",
    },
    {
      label: "메뉴 2 · 사진 하단",
      menuItems: ["콩나물국", "춘권튀김", "단무지", "깍두기"],
      representativeMenuItem: "춘권튀김",
    },
  ],
  uncertainTexts: [E2E_VERIFIED_UNCERTAIN_TEXT],
};

export const e2eVerifiedMeal: WeeklyMeal = {
  weekStart: "2026-08-10",
  updatedAt: "2026-08-13T11:57:57+09:00",
  status: "DATE_VERIFIED",
  sourceNotes: [E2E_VERIFIED_SOURCE_NOTE],
  meals,
};

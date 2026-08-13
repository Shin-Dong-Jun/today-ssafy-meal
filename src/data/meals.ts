export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export interface MealOption {
  /** 사진에서 코너명이 확인되지 않으면 위치를 기준으로 임시 표시 */
  label: string;
  menuItems: string[];
}

export interface DailyMeal {
  /** Asia/Seoul 기준 YYYY-MM-DD */
  date: string;
  dayOfWeek: DayOfWeek;
  /** 같은 날 제공되는 선택 메뉴/배식 라인 */
  mealOptions: MealOption[];
  /** 식단표 사진에서 확실하게 읽지 못한 원문이나 설명 */
  uncertainTexts: string[];
}

export interface WeeklyMeal {
  /** 해당 주 월요일, Asia/Seoul 기준 YYYY-MM-DD */
  weekStart: string;
  /** ISO 8601 형식. 대한민국 시각은 +09:00 오프셋을 권장 */
  updatedAt: string;
  isSample: boolean;
  /** 날짜나 표 구조처럼 한 주 전체에 적용되는 판독 주의사항 */
  sourceNotes: string[];
  meals: DailyMeal[];
}

/**
 * 사용자가 제공한 식단표 사진을 판독한 데이터입니다.
 * 흐릿한 글자는 menuItems에 추측해 넣지 않고 uncertainTexts에 기록합니다.
 */
export const weeklyMeal: WeeklyMeal = {
  weekStart: "2026-08-10",
  updatedAt: "2026-08-13T11:57:57+09:00",
  isSample: false,
  sourceNotes: [
    "사진에 날짜 머리글이 보이지 않아 테스트를 위해 2026년 8월 10일부터 14일까지로 연결했습니다.",
    "상단·하단 블록의 코너명이 잘려 있어 같은 날의 메뉴 1·메뉴 2로 표시했습니다.",
  ],
  meals: [
    {
      date: "2026-08-10",
      dayOfWeek: "MONDAY",
      mealOptions: [
        {
          label: "메뉴 1 · 사진 상단",
          menuItems: ["흰쌀밥", "두부찜", "오이고추&쌈장", "깍두기"],
        },
        {
          label: "메뉴 2 · 사진 하단",
          menuItems: [
            "돈육낙지덮밥",
            "계란국",
            "불만두강정",
            "오이고추&쌈장",
            "콘치커리샐러드",
            "포기김치",
          ],
        },
      ],
      uncertainTexts: [
        "메뉴 1의 국은 ‘뚝배기설렁탕’으로 보이지만 확실하지 않습니다.",
        "메뉴 1의 볶음 메뉴 한 가지는 글자가 흐려 확인하지 못했습니다.",
      ],
    },
    {
      date: "2026-08-11",
      dayOfWeek: "TUESDAY",
      mealOptions: [
        {
          label: "메뉴 1 · 사진 상단",
          menuItems: [
            "흰쌀밥",
            "연근흑임자샐러드",
            "가지나물",
            "포기김치",
          ],
        },
        {
          label: "메뉴 2 · 사진 하단",
          menuItems: ["후리가케밥", "포기김치"],
        },
      ],
      uncertainTexts: [
        "메뉴 1의 주메뉴는 ‘순살닭갈비’로 보이지만 확실하지 않습니다.",
        "메뉴 1의 감자 메뉴 한 가지는 정확한 조리명을 확인하지 못했습니다.",
        "메뉴 2에는 함박스테이크, 우동국, 토마토스파게티, 오이무침으로 보이는 항목이 있으나 글자가 흐립니다.",
      ],
    },
    {
      date: "2026-08-12",
      dayOfWeek: "WEDNESDAY",
      mealOptions: [
        {
          label: "메뉴 1 · 사진 상단",
          menuItems: [
            "흰쌀밥",
            "들깨미역국",
            "돈육간장불고기",
            "계란찜",
            "콩나물무침",
            "포기김치",
          ],
        },
        {
          label: "메뉴 2 · 사진 하단",
          menuItems: [
            "치킨마요덮밥",
            "들깨미역국",
            "콩나물무침",
            "포기김치",
          ],
        },
      ],
      uncertainTexts: [
        "메뉴 2에 ‘계란장조림’, ‘허니버터감자’로 보이는 항목이 있으나 확실하지 않습니다.",
      ],
    },
    {
      date: "2026-08-13",
      dayOfWeek: "THURSDAY",
      mealOptions: [
        {
          label: "메뉴 1 · 사진 상단",
          menuItems: ["흰쌀밥", "계란말이", "오징어실채볶음", "깍두기"],
        },
        {
          label: "메뉴 2 · 사진 하단",
          menuItems: ["콩나물국", "춘권튀김", "단무지", "깍두기"],
        },
      ],
      uncertainTexts: [
        "메뉴 1의 국 또는 찌개 이름은 사진에서 확인하지 못했습니다.",
        "두 메뉴에 ‘프로틴연두부무침’으로 보이는 항목이 있으나 확실하지 않습니다.",
        "메뉴 2의 주메뉴는 ‘대패삼겹덮밥’으로 보이지만 확실하지 않습니다.",
      ],
    },
    {
      date: "2026-08-14",
      dayOfWeek: "FRIDAY",
      mealOptions: [
        {
          label: "메뉴 1 · 사진 상단",
          menuItems: [
            "잡곡밥",
            "우거지해장국",
            "녹두전",
            "채소반찬",
            "고추지양파절임",
            "깍두기",
          ],
        },
        {
          label: "메뉴 2 · 사진 하단",
          menuItems: [
            "삼색온도토리묵국수",
            "멸치온육수",
            "돼지갈비솥밥",
            "비빔고추장",
            "고추냉이김",
            "포기김치",
          ],
        },
      ],
      uncertainTexts: [],
    },
  ],
};

export function getDailyMenuItems(meal: DailyMeal): string[] {
  return meal.mealOptions.flatMap((option) => option.menuItems);
}

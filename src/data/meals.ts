export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export type MealDataStatus =
  | "DATE_VERIFIED"
  | "DATE_UNVERIFIED"
  | "SAMPLE";

export interface MealOption {
  /** 사진에서 코너명이 확인되지 않으면 위치를 기준으로 임시 표시 */
  label: string;
  menuItems: string[];
  /** 사진에서 대표 음식이 확인된 경우 같은 option의 menuItems 값, 미확인 시 null */
  representativeMenuItem: string | null;
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
  /** 실제 날짜 확인 여부 또는 샘플 데이터 여부 */
  status: MealDataStatus;
  /** 날짜나 표 구조처럼 한 주 전체에 적용되는 판독 주의사항 */
  sourceNotes: string[];
  meals: DailyMeal[];
}

/**
 * 식단표 사진에서 확인한 데이터입니다.
 * 흐릿한 글자는 menuItems에 추측해 넣지 않고 uncertainTexts에 기록합니다.
 */
export const weeklyMeal: WeeklyMeal = {
  weekStart: "2026-08-24",
  updatedAt: "2026-08-25T11:44:40+09:00",
  status: "DATE_VERIFIED",
  sourceNotes: [
    "제공자가 이번 주 식단 사진으로 전달했으며, 사진에서 8월 24일(월)부터 28일(금)까지의 날짜를 확인했습니다.",
    "사진에 연도는 없지만 제공 시점의 이번 주 일정과 요일 조합이 일치해 2026년 8월 24일부터 28일까지의 식단으로 기록했습니다.",
    "중식 A/B 블록만 반영했으며 식수, PLUS 공통 제공란, 조식·석식은 제외했습니다.",
  ],
  meals: [
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
    },
  ],
};

export function getDailyMenuItems(meal: DailyMeal): string[] {
  return meal.mealOptions.flatMap((option) => option.menuItems);
}

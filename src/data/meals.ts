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
  weekStart: "2026-08-31",
  updatedAt: "2026-09-02T09:21:16+09:00",
  status: "DATE_VERIFIED",
  sourceNotes: [
    "제공자가 이번 주 식단 사진으로 전달했으며, 사진에서 8월 31일(월)부터 9월 4일(금)까지의 날짜를 확인했습니다.",
    "사진에 연도는 없지만 제공 시점의 이번 주 일정과 요일 조합이 일치해 2026년 8월 31일부터 9월 4일까지의 식단으로 기록했습니다.",
    "중식 A/B 블록만 반영했으며 식수, PLUS 공통 제공란, 조식·석식은 제외했습니다.",
  ],
  meals: [
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
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
      uncertainTexts: [],
    },
  ],
};

export function getDailyMenuItems(meal: DailyMeal): string[] {
  return meal.mealOptions.flatMap((option) => option.menuItems);
}

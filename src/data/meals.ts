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
  weekStart: "2026-08-17",
  updatedAt: "2026-08-18T12:59:36+09:00",
  status: "DATE_VERIFIED",
  sourceNotes: [
    "제공자가 이번 주 식단 사진으로 전달했으며, 사진에서 8월 18일(화)부터 21일(금)까지의 날짜를 확인했습니다.",
    "사진에 연도는 없지만 제공 시점의 이번 주 일정과 요일 조합이 일치해 2026년 8월 17일부터 21일까지의 식단으로 기록했습니다.",
    "8월 17일(월) 열은 사진 촬영 범위 밖이라 메뉴를 등록하지 않았습니다.",
    "점심 A/B 블록만 반영했으며 인원 수와 공통 제공란, 조식·석식은 제외했습니다.",
  ],
  meals: [
    {
      date: "2026-08-17",
      dayOfWeek: "MONDAY",
      mealOptions: [],
      uncertainTexts: [
        "8월 17일(월) 열은 제공된 사진에 포함되지 않아 점심 A/B 메뉴를 확인할 수 없습니다.",
      ],
    },
    {
      date: "2026-08-18",
      dayOfWeek: "TUESDAY",
      mealOptions: [
        {
          label: "중식 A",
          menuItems: [
            "잡곡밥",
            "바지락된장국",
            "돈육고추장볶음",
            "어묵깻잎전",
            "청포묵무침",
            "포기김치",
          ],
          representativeMenuItem: null,
        },
        {
          label: "중식 B",
          menuItems: [
            "(뚝)날치알밥",
            "덴가스국",
            "라구파스타",
            "고구마샐러드",
            "오이피클",
            "깍두기",
          ],
          representativeMenuItem: null,
        },
      ],
      uncertainTexts: [],
    },
    {
      date: "2026-08-19",
      dayOfWeek: "WEDNESDAY",
      mealOptions: [
        {
          label: "중식 A",
          menuItems: [
            "잡곡밥",
            "(뚝)설렁탕",
            "오징어숙회무침",
            "생선커틀렛",
            "파래무침",
            "깍두기",
          ],
          representativeMenuItem: null,
        },
        {
          label: "중식 B",
          menuItems: [
            "베이컨갈릭볶음밥",
            "꼬치어묵국",
            "식빵피자토스트",
            "연두부찜",
            "실곤약초장무침",
            "포기김치",
          ],
          representativeMenuItem: null,
        },
      ],
      uncertainTexts: [],
    },
    {
      date: "2026-08-20",
      dayOfWeek: "THURSDAY",
      mealOptions: [
        {
          label: "중식 A",
          menuItems: [
            "잡곡밥",
            "제주식고사리해장국",
            "너비아니구이",
            "메추리알맵조림",
            "느타리버섯볶음",
            "깍두기",
          ],
          representativeMenuItem: null,
        },
        {
          label: "중식 B",
          menuItems: [
            "중화덮밥&후라이",
            "계란국",
            "자장라면",
            "느타리버섯볶음",
            "단무지",
            "포기김치",
          ],
          representativeMenuItem: null,
        },
      ],
      uncertainTexts: [
        "중식 A의 제주식고사리해장국 앞 괄호 표기는 판독이 엇갈려 메뉴명에서 제외했습니다.",
      ],
    },
    {
      date: "2026-08-21",
      dayOfWeek: "FRIDAY",
      mealOptions: [
        {
          label: "중식 A",
          menuItems: [
            "잡곡밥",
            "(뚝)얼큰만두전골",
            "두부탕수",
            "진미채채소무침",
            "오이탕탕이",
            "깍두기",
          ],
          representativeMenuItem: null,
        },
        {
          label: "중식 B",
          menuItems: [
            "잔치국수",
            "미니보쌈&무생채",
            "김가루양념밥",
            "오이탕탕이",
            "배추겉절이김치",
          ],
          representativeMenuItem: null,
        },
      ],
      uncertainTexts: [
        "중식 B의 ‘미니보쌈’ 다음 줄에 ‘&무생채’가 이어져 하나의 메뉴명으로 기록했습니다.",
      ],
    },
  ],
};

export function getDailyMenuItems(meal: DailyMeal): string[] {
  return meal.mealOptions.flatMap((option) => option.menuItems);
}

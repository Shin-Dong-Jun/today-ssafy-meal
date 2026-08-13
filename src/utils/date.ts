import type { DailyMeal, DayOfWeek, WeeklyMeal } from "../data/meals";

export const SEOUL_TIME_ZONE = "Asia/Seoul";

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "월요일",
  TUESDAY: "화요일",
  WEDNESDAY: "수요일",
  THURSDAY: "목요일",
  FRIDAY: "금요일",
};

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const dateKeyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SEOUL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: SEOUL_TIME_ZONE,
  weekday: "short",
});

const WEEKDAY_OFFSETS: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export type MealWeekStatus = "CURRENT" | "PAST" | "FUTURE";

export function getSeoulDateKey(date: Date = new Date()): string {
  const parts = dateKeyFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("대한민국 기준 날짜를 계산할 수 없습니다.");
  }

  return `${year}-${month}-${day}`;
}

export function isSeoulWeekend(date: Date = new Date()): boolean {
  const weekday = weekdayFormatter.format(date);
  return weekday === "Sat" || weekday === "Sun";
}

export function getSeoulWeekStartKey(date: Date = new Date()): string {
  const [year, month, day] = getSeoulDateKey(date).split("-").map(Number);
  const weekdayOffset = WEEKDAY_OFFSETS[weekdayFormatter.format(date)];

  if (!year || !month || !day || weekdayOffset === undefined) {
    throw new Error("대한민국 기준 주 시작일을 계산할 수 없습니다.");
  }

  return new Date(Date.UTC(year, month - 1, day - weekdayOffset))
    .toISOString()
    .slice(0, 10);
}

export function getMealWeekStatus(
  weekStart: string,
  date: Date = new Date(),
): MealWeekStatus {
  const currentWeekStart = getSeoulWeekStartKey(date);

  if (weekStart === currentWeekStart) {
    return "CURRENT";
  }

  return weekStart < currentWeekStart ? "PAST" : "FUTURE";
}

export function formatCurrentDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function formatMealDate(date: string, dayOfWeek: DayOfWeek): string {
  const [, month, day] = date.split("-").map(Number);

  if (!month || !day) {
    return date;
  }

  return `${month}월 ${day}일 ${DAY_OF_WEEK_LABELS[dayOfWeek]}`;
}

export function formatUpdatedAt(updatedAt: string): string {
  const parsed = new Date(updatedAt);

  if (Number.isNaN(parsed.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function formatUpdatedAtCompact(
  updatedAt: string,
  currentDate: Date = new Date(),
): string {
  const parsed = new Date(updatedAt);

  if (Number.isNaN(parsed.getTime())) {
    return updatedAt;
  }

  const time = new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);

  if (getSeoulDateKey(parsed) === getSeoulDateKey(currentDate)) {
    return `오늘 ${time} 업데이트`;
  }

  const date = new Intl.DateTimeFormat("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsed);

  return `${date} ${time} 업데이트`;
}

export function formatMealWeekRange(weekStart: string): string {
  const [year, month, day] = weekStart.split("-").map(Number);

  if (!year || !month || !day) {
    return weekStart;
  }

  const end = new Date(Date.UTC(year, month - 1, day + 4));
  const endMonth = end.getUTCMonth() + 1;
  const endDay = end.getUTCDate();

  if (month === endMonth) {
    return `${month}월 ${day}일~${endDay}일`;
  }

  return `${month}월 ${day}일~${endMonth}월 ${endDay}일`;
}

/**
 * 데이터에 특정 요일 레코드가 빠져도 월~금 카드가 사라지지 않게 5개 슬롯을 만듭니다.
 * UTC는 시각 변환이 아니라 YYYY-MM-DD 달력 날짜 덧셈에만 사용합니다.
 */
export function buildWeekdayMealSlots(weekly: WeeklyMeal): DailyMeal[] {
  const [year, month, day] = weekly.weekStart.split("-").map(Number);

  if (!year || !month || !day) {
    return weekly.meals;
  }

  return WEEKDAYS.map((dayOfWeek, index) => {
    const date = new Date(Date.UTC(year, month - 1, day + index))
      .toISOString()
      .slice(0, 10);
    const registeredMeal = weekly.meals.find((meal) => meal.date === date);

    return (
      registeredMeal ?? {
        date,
        dayOfWeek,
        mealOptions: [],
        uncertainTexts: [],
      }
    );
  });
}

import type { DailyMeal, WeeklyMeal } from "../data/meals";
import { DAY_OF_WEEK_LABELS, type MealWeekStatus } from "../utils/date";

export interface MealNavigatorItem {
  targetId: string;
  label: string;
  desktopLabel?: string;
  accessibleLabel?: string;
}

export interface MealNavigatorModel {
  items: readonly MealNavigatorItem[];
  ariaLabel: string;
}

export function buildMealNavigatorModel(
  mealData: WeeklyMeal,
  mealWeekStatus: MealWeekStatus,
  weekdayMeals: readonly DailyMeal[],
): MealNavigatorModel {
  const isDateVerified = mealData.status === "DATE_VERIFIED";
  const leadItem: MealNavigatorItem = isDateVerified
    ? mealWeekStatus === "CURRENT"
      ? { targetId: "today-section", label: "오늘" }
      : { targetId: "meal-data-notice", label: "안내" }
    : {
        targetId: "meal-data-notice",
        label: mealData.status === "SAMPLE" ? "예시 안내" : "안내",
      };
  const mealItems = weekdayMeals.map((meal, index) => {
    if (!isDateVerified) {
      return {
        targetId: `meal-slot-${index + 1}`,
        label:
          mealData.status === "SAMPLE"
            ? `예시 ${index + 1}`
            : `식단 ${index + 1}`,
      };
    }

    const [, month, day] = meal.date.split("-").map(Number);
    const weekday = DAY_OF_WEEK_LABELS[meal.dayOfWeek];

    return {
      targetId: `meal-${meal.date}`,
      label: weekday.slice(0, 1),
      desktopLabel: `${weekday.slice(0, 1)} ${day}`,
      accessibleLabel: `${month}월 ${day}일 ${weekday} 식단`,
    };
  });

  return {
    items: [leadItem, ...mealItems],
    ariaLabel: isDateVerified
      ? mealWeekStatus === "PAST"
        ? "지난 식단 바로가기"
        : mealWeekStatus === "FUTURE"
          ? "예정 식단 바로가기"
          : "식단 바로가기"
      : mealData.status === "SAMPLE"
        ? "예시 식단 바로가기"
        : "사진 순서 바로가기",
  };
}

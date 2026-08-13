import type { DailyMeal } from "../data/meals";

export const MEAL_DECISION_STORAGE_KEY =
  "today-ssafy-meal:meal-decision:v1";

export interface MealDecision {
  version: 1;
  mealDate: string;
  optionIndex: number;
  optionLabel: string;
  dataUpdatedAt: string;
}

function getMealOption(meal: DailyMeal, optionIndex: number) {
  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    return undefined;
  }

  return meal.mealOptions[optionIndex];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createMealDecision(
  meal: DailyMeal,
  optionIndex: number,
  dataUpdatedAt: string,
): MealDecision | null {
  const option = getMealOption(meal, optionIndex);

  if (!option) {
    return null;
  }

  return {
    version: 1,
    mealDate: meal.date,
    optionIndex,
    optionLabel: option.label,
    dataUpdatedAt,
  };
}

export function parseMealDecision(
  raw: string | null | undefined,
  meal: DailyMeal | undefined,
  todayKey: string,
  dataUpdatedAt: string,
): MealDecision | null {
  if (!raw || !meal || meal.date !== todayKey) {
    return null;
  }

  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    !isRecord(value) ||
    value.version !== 1 ||
    value.mealDate !== todayKey ||
    value.dataUpdatedAt !== dataUpdatedAt ||
    typeof value.optionIndex !== "number" ||
    !Number.isInteger(value.optionIndex) ||
    typeof value.optionLabel !== "string"
  ) {
    return null;
  }

  const option = getMealOption(meal, value.optionIndex);

  if (!option || option.label !== value.optionLabel) {
    return null;
  }

  return {
    version: 1,
    mealDate: value.mealDate,
    optionIndex: value.optionIndex,
    optionLabel: value.optionLabel,
    dataUpdatedAt: value.dataUpdatedAt,
  };
}

export function buildMealDecisionShareText(
  meal: DailyMeal,
  optionIndex: number,
): string {
  const option = getMealOption(meal, optionIndex);

  if (!option) {
    throw new RangeError("공유할 식단 선택지가 존재하지 않습니다.");
  }

  const optionLetter = String.fromCharCode("A".charCodeAt(0) + optionIndex);
  const [, month, day] = meal.date.split("-").map(Number);
  const dateLabel = month && day ? `${month}월 ${day}일` : meal.date;
  const menuSummary = option.menuItems.join(", ");

  return [
    `오늘 싸피밥 · ${dateLabel}`,
    `메뉴 ${optionLetter} · ${option.label}`,
    menuSummary,
    "#오늘싸피밥",
  ]
    .filter(Boolean)
    .join("\n");
}

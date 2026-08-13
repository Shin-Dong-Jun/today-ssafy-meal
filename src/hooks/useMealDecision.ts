import { useCallback, useEffect, useState } from "react";

import type { DailyMeal } from "../data/meals";
import {
  createMealDecision,
  MEAL_DECISION_STORAGE_KEY,
  parseMealDecision,
  type MealDecision,
} from "../utils/mealDecision";

interface UseMealDecisionOptions {
  meal?: DailyMeal;
  todayKey: string;
  dataUpdatedAt: string;
}

interface UseMealDecisionResult {
  decision: MealDecision | null;
  saveDecision: (optionIndex: number) => void;
  clearDecision: () => void;
}

function safelyRemoveStoredDecision(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(MEAL_DECISION_STORAGE_KEY);
  } catch {
    // 저장소가 차단되어도 현재 화면의 선택 기능은 계속 동작합니다.
  }
}

function readStoredDecision(
  meal: DailyMeal | undefined,
  todayKey: string,
  dataUpdatedAt: string,
): MealDecision | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null;

  try {
    raw = window.localStorage.getItem(MEAL_DECISION_STORAGE_KEY);
  } catch {
    return null;
  }

  const parsed = parseMealDecision(raw, meal, todayKey, dataUpdatedAt);

  if (raw !== null && parsed === null) {
    safelyRemoveStoredDecision();
  }

  return parsed;
}

export function useMealDecision({
  meal,
  todayKey,
  dataUpdatedAt,
}: UseMealDecisionOptions): UseMealDecisionResult {
  const [decision, setDecision] = useState<MealDecision | null>(() =>
    readStoredDecision(meal, todayKey, dataUpdatedAt),
  );

  useEffect(() => {
    setDecision(readStoredDecision(meal, todayKey, dataUpdatedAt));
  }, [dataUpdatedAt, meal, todayKey]);

  const saveDecision = useCallback(
    (optionIndex: number) => {
      if (!meal || meal.date !== todayKey) {
        return;
      }

      const nextDecision = createMealDecision(
        meal,
        optionIndex,
        dataUpdatedAt,
      );

      if (!nextDecision) {
        return;
      }

      setDecision(nextDecision);

      try {
        window.localStorage.setItem(
          MEAL_DECISION_STORAGE_KEY,
          JSON.stringify(nextDecision),
        );
      } catch {
        // 메모리 상태는 유지하고 영속화 실패만 무시합니다.
      }
    },
    [dataUpdatedAt, meal, todayKey],
  );

  const clearDecision = useCallback(() => {
    setDecision(null);
    safelyRemoveStoredDecision();
  }, []);

  const currentOption =
    decision && meal ? meal.mealOptions[decision.optionIndex] : undefined;
  const currentDecision =
    decision &&
    meal?.date === todayKey &&
    decision.mealDate === todayKey &&
    decision.dataUpdatedAt === dataUpdatedAt &&
    currentOption?.label === decision.optionLabel
      ? decision
      : null;

  return { decision: currentDecision, saveDecision, clearDecision };
}

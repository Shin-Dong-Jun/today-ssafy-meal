import { useEffect, useState, type RefObject } from "react";

import type { DailyMeal } from "../data/meals";
import { buildMealDecisionShareText } from "../utils/mealDecision";
import type { SelectableMealOption } from "./MealRouletteDialog";

interface MealDecisionPanelProps {
  meal: DailyMeal;
  selectedOption?: SelectableMealOption;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onOpenRoulette: () => void;
  onClear: () => void;
}

export function MealDecisionPanel({
  meal,
  selectedOption,
  triggerRef,
  onOpenRoulette,
  onClear,
}: MealDecisionPanelProps) {
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    setShareStatus("");
  }, [selectedOption?.optionIndex]);

  const openRoulette = () => {
    setShareStatus("");
    onOpenRoulette();
  };

  const shareDecision = async () => {
    if (!selectedOption) {
      return;
    }

    const text = buildMealDecisionShareText(meal, selectedOption.optionIndex);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "오늘 싸피밥 · 오늘의 픽",
          text,
          url: window.location.href,
        });
        setShareStatus("선택 메뉴를 공유했어요.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setShareStatus("선택 메뉴와 링크를 복사했어요.");
    } catch {
      setShareStatus("공유하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  if (!selectedOption) {
    return (
      <div className="roulette-entry">
        <p>
          <strong>A/B 고민될 때</strong>
          <span>룰렛의 선택을 오늘 하루 기억해드려요</span>
        </p>
        <button
          type="button"
          ref={triggerRef}
          aria-haspopup="dialog"
          aria-controls="meal-roulette-dialog"
          onClick={openRoulette}
        >
          룰렛 열기
        </button>
      </div>
    );
  }

  const optionLetter = String.fromCharCode(65 + selectedOption.optionIndex);

  return (
    <div className="meal-decision" aria-label="저장된 오늘의 메뉴 선택">
      <div className="meal-decision-summary">
        <span className="meal-decision-check" aria-hidden="true">
          ✓
        </span>
        <p>
          <span>오늘의 픽</span>
          <strong>
            메뉴 {optionLetter} · {selectedOption.option.label}
          </strong>
          <small>이 기기에서 오늘 자정까지 기억해요.</small>
        </p>
      </div>

      <div className="meal-decision-actions">
        <button
          type="button"
          className="meal-decision-share"
          onClick={shareDecision}
        >
          공유
        </button>
        <button
          type="button"
          ref={triggerRef}
          aria-haspopup="dialog"
          aria-controls="meal-roulette-dialog"
          onClick={openRoulette}
        >
          다시 고르기
        </button>
        <button
          type="button"
          className="meal-decision-clear"
          onClick={() => {
            setShareStatus("");
            onClear();
            window.requestAnimationFrame(() => triggerRef.current?.focus());
          }}
        >
          선택 취소
        </button>
      </div>

      <p
        className="meal-decision-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {shareStatus}
      </p>
    </div>
  );
}

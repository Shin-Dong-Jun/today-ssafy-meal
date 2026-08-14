import { useEffect, useRef, useState, type RefObject } from "react";

import type { MealOption } from "../data/meals";
import {
  createMealRouletteOdds,
  getMealRouletteLandingRotation,
  pickMealRouletteOption,
  type MealRouletteOdds,
} from "../utils/pickMealOption";

export interface SelectableMealOption {
  option: MealOption;
  optionIndex: number;
}

interface MealRouletteDialogProps {
  selectableOptions: SelectableMealOption[];
  selectedOption?: SelectableMealOption;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  onSelect: (optionIndex: number) => void;
  onClose: () => void;
}

const ROULETTE_DURATION_MS = 1800;

export function MealRouletteDialog({
  selectableOptions,
  selectedOption,
  returnFocusRef,
  onSelect,
  onClose,
}: MealRouletteDialogProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteOdds] = useState<MealRouletteOdds>(() =>
    createMealRouletteOdds(Math.random()),
  );
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const spinTimeoutRef = useRef<number | null>(null);
  const spinStartRotationRef = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => {
        titleRef.current?.focus({ preventScroll: true });

        if (sheetRef.current) {
          sheetRef.current.scrollTop = 0;
        }
      });
    }

    return () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const closeRoulette = () => dialogRef.current?.close();

  const handleRouletteClosed = () => {
    if (spinTimeoutRef.current !== null) {
      window.clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    if (isSpinning) {
      setRouletteRotation(spinStartRotationRef.current);
      setIsSpinning(false);
    }

    onClose();
    window.requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  const spinRoulette = () => {
    if (isSpinning || selectableOptions.length !== 2) {
      return;
    }

    const selectedSelectableIndex = pickMealRouletteOption(
      rouletteOdds,
      Math.random(),
    );
    const selectedMealOptionIndex =
      selectableOptions[selectedSelectableIndex].optionIndex;
    const nextRotation = getMealRouletteLandingRotation(
      selectedSelectableIndex,
      rouletteOdds,
      Math.random(),
      rouletteRotation,
    );

    spinStartRotationRef.current = rouletteRotation;
    setIsSpinning(true);
    setRouletteRotation(nextRotation);

    const finishSpin = () => {
      onSelect(selectedMealOptionIndex);
      setIsSpinning(false);
      spinTimeoutRef.current = null;
    };
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      finishSpin();
      return;
    }

    spinTimeoutRef.current = window.setTimeout(
      finishSpin,
      ROULETTE_DURATION_MS,
    );
  };

  return (
    <dialog
      id="meal-roulette-dialog"
      className="roulette-dialog"
      ref={dialogRef}
      aria-labelledby="roulette-title"
      aria-describedby="roulette-description"
      onCancel={(event) => {
        event.preventDefault();
        closeRoulette();
      }}
      onClose={handleRouletteClosed}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeRoulette();
        }
      }}
    >
      <div className="roulette-sheet" ref={sheetRef}>
        <header className="roulette-header">
          <div>
            <p>A/B 메뉴 룰렛</p>
            <h3 id="roulette-title" ref={titleRef} tabIndex={-1}>
              오늘은 어디로 갈까요?
            </h3>
          </div>
          <button
            className="roulette-close"
            type="button"
            aria-label="룰렛 닫기"
            onClick={closeRoulette}
          >
            ×
          </button>
        </header>

        <p className="roulette-description" id="roulette-description">
          이번에는 한쪽 메뉴에 55~65%의 행운을 줬어요. 어느 쪽이 유리할지는
          룰렛을 열 때마다 바뀝니다.
        </p>

        <div className="roulette-stage">
          <span className="roulette-pointer" aria-hidden="true" />
          <div
            className={`roulette-wheel${isSpinning ? " roulette-wheel--spinning" : ""}`}
            style={{
              background: `conic-gradient(var(--color-roulette-a) 0 ${rouletteOdds.optionA}%, var(--color-roulette-b) ${rouletteOdds.optionA}% 100%)`,
              transform: `rotate(${rouletteRotation}deg)`,
            }}
            aria-hidden="true"
          >
            <span className="roulette-label roulette-label--a">A</span>
            <span className="roulette-label roulette-label--b">B</span>
          </div>
        </div>

        <div className="roulette-odds" aria-label="이번 룰렛 확률">
          <span>메뉴 A {rouletteOdds.optionA}%</span>
          <span>메뉴 B {rouletteOdds.optionB}%</span>
        </div>

        <div
          className="roulette-result"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isSpinning ? (
            <p>룰렛이 메뉴를 고르는 중이에요…</p>
          ) : selectedOption ? (
            <p>
              저장된 선택은{" "}
              <strong>
                메뉴 {String.fromCharCode(65 + selectedOption.optionIndex)}
              </strong>
              입니다.
            </p>
          ) : (
            <p>버튼을 눌러 오늘의 메뉴를 정해보세요.</p>
          )}
        </div>

        <button
          className="roulette-spin-button"
          type="button"
          disabled={isSpinning}
          onClick={spinRoulette}
        >
          {isSpinning
            ? "돌아가는 중…"
            : selectedOption
              ? "새로 돌려서 저장하기"
              : "룰렛 돌리고 저장하기"}
        </button>
      </div>
    </dialog>
  );
}

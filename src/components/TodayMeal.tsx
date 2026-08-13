import { useEffect, useRef, useState } from "react";

import { getDailyMenuItems, type DailyMeal } from "../data/meals";
import { assessProtein } from "../utils/assessProtein";
import {
  DAY_OF_WEEK_LABELS,
  formatCurrentDate,
  formatMealDate,
} from "../utils/date";
import {
  createMealRouletteOdds,
  getMealRouletteLandingRotation,
  pickMealRouletteOption,
  type MealRouletteOdds,
} from "../utils/pickMealOption";

interface TodayMealProps {
  currentDate: Date;
  todayKey: string;
  meal?: DailyMeal;
  weekMeals: DailyMeal[];
  isWeekend: boolean;
}

interface MealPick {
  mealDate: string;
  optionIndex: number;
}

const ROULETTE_DURATION_MS = 1800;

export function TodayMeal({
  currentDate,
  todayKey,
  meal,
  weekMeals,
  isWeekend,
}: TodayMealProps) {
  const [mealPick, setMealPick] = useState<MealPick | null>(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteOdds, setRouletteOdds] = useState<MealRouletteOdds>({
    optionA: 50,
    optionB: 50,
  });
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const spinTimeoutRef = useRef<number | null>(null);
  const spinStartRotationRef = useRef(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const menuItems = meal ? getDailyMenuItems(meal) : [];
  const assessment = assessProtein(menuItems, meal?.uncertainTexts ?? []);
  const proteinItems =
    assessment.matchedMenuItems.length > 0
      ? assessment.matchedMenuItems
      : assessment.possibleMenuItems;
  const matchedProteinItems = new Set(assessment.matchedMenuItems);
  const selectableOptions =
    meal?.mealOptions
      .map((option, optionIndex) => ({ option, optionIndex }))
      .filter(({ option }) => option.menuItems.length > 0) ?? [];
  const selectedOptionIndex =
    mealPick && mealPick.mealDate === meal?.date
      ? mealPick.optionIndex
      : null;
  const selectedOption =
    selectedOptionIndex === null
      ? undefined
      : selectableOptions.find(
          ({ optionIndex }) => optionIndex === selectedOptionIndex,
        );

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (isRouletteOpen && dialog && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => spinButtonRef.current?.focus());
    }
  }, [isRouletteOpen]);

  const openRoulette = () => {
    if (spinTimeoutRef.current !== null) {
      window.clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    setRouletteOdds(createMealRouletteOdds(Math.random()));
    setRouletteRotation(0);
    setMealPick(null);
    setIsSpinning(false);
    setIsRouletteOpen(true);
  };

  const handleRouletteClosed = () => {
    if (spinTimeoutRef.current !== null) {
      window.clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    if (isSpinning) {
      setRouletteRotation(spinStartRotationRef.current);
      setIsSpinning(false);
    }

    setIsRouletteOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const closeRoulette = () => dialogRef.current?.close();

  const spinRoulette = () => {
    if (!meal || isSpinning || selectableOptions.length !== 2) {
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
    setMealPick(null);

    const finishSpin = () => {
      setMealPick({
        mealDate: meal.date,
        optionIndex: selectedMealOptionIndex,
      });
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
    <section className="today-section" aria-labelledby="today-heading">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">점심</p>
          <h2 id="today-heading">오늘의 메뉴</h2>
        </div>
        <time className="section-date" dateTime={meal?.date ?? todayKey}>
          {meal && !isWeekend
            ? formatMealDate(meal.date, meal.dayOfWeek)
            : formatCurrentDate(currentDate)}
        </time>
      </div>

      <ol className="weekday-strip" aria-label="이번 주 평일 날짜">
        {weekMeals.map((weekdayMeal) => {
          const [, month, day] = weekdayMeal.date.split("-").map(Number);
          const isToday = weekdayMeal.date === todayKey;
          const dayLabel = DAY_OF_WEEK_LABELS[weekdayMeal.dayOfWeek];

          return (
            <li
              className={
                isToday ? "weekday-chip weekday-chip--today" : "weekday-chip"
              }
              key={weekdayMeal.date}
            >
              <a
                href={`#meal-${weekdayMeal.date}`}
                aria-current={isToday ? "date" : undefined}
                aria-label={`${month}월 ${day}일 ${dayLabel} 식단으로 이동`}
              >
                <time dateTime={weekdayMeal.date}>
                  <span>{dayLabel.slice(0, 1)}</span>
                  <strong>{day}</strong>
                  {isToday && <i aria-hidden="true" />}
                </time>
              </a>
            </li>
          );
        })}
      </ol>

      <div className="today-card">
        {isWeekend ? (
          <div className="empty-state">
            <time className="empty-state-date" dateTime={todayKey}>
              {formatCurrentDate(currentDate)}
            </time>
            <strong>오늘은 등록된 점심 식단이 없어요</strong>
            <p>아래에서 이번 주 식단을 다시 확인할 수 있어요.</p>
          </div>
        ) : !meal || menuItems.length === 0 ? (
          <div className="empty-state">
            <time className="empty-state-date" dateTime={todayKey}>
              {formatCurrentDate(currentDate)}
            </time>
            <strong>오늘 식단이 아직 등록되지 않았어요</strong>
            <p>식단표가 확인되면 정적 데이터를 업데이트할 예정이에요.</p>
          </div>
        ) : (
          <>
            <div className="today-menu-groups">
              {meal.mealOptions.map((option, optionIndex) => {
                const isSelected = optionIndex === selectedOption?.optionIndex;

                return (
                  <section
                    className={`today-menu-group${isSelected ? " today-menu-group--selected" : ""}`}
                    key={option.label}
                  >
                    <header className="menu-group-heading">
                      <div className="menu-group-labels">
                        <span>메뉴 {String.fromCharCode(65 + optionIndex)}</span>
                        {isSelected && <strong>룰렛의 선택</strong>}
                      </div>
                      <h3>{option.label}</h3>
                    </header>
                    <ul className="today-menu-list">
                      {option.menuItems.map((item, itemIndex) => {
                        const isProteinItem = matchedProteinItems.has(item);

                        return (
                          <li
                            className={
                              isProteinItem ? "is-protein-item" : undefined
                            }
                            key={`${option.label}-${itemIndex}`}
                          >
                            <span
                              className="menu-item-marker"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>

            {selectableOptions.length === 2 && (
              <div className="roulette-entry">
                <p>
                  <strong>A/B 고민될 때</strong>
                  <span>메뉴를 다 봤는데도 못 고르겠다면</span>
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
            )}

            <div className="protein-summary">
              <div className="protein-heading">
                <p className="protein-heading-label">메뉴명 기준 단백질 체크</p>
                <p
                  className={`protein-status protein-status--${assessment.status.toLowerCase()}`}
                >
                  <span className="protein-status-dot" aria-hidden="true" />
                  {assessment.label}
                </p>
              </div>
              {proteinItems.length > 0 && (
                <div className="protein-items">
                  <span className="protein-items-label">
                    {assessment.status === "POSSIBLE"
                      ? "가능성이 있는 항목"
                      : "판정된 메뉴"}
                  </span>
                  <ul>
                    {proteinItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="protein-note">
                메뉴명만을 기준으로 한 대략적인 판단이며 실제 재료와 제공량에
                따라 다를 수 있습니다.
              </p>
            </div>
          </>
        )}
      </div>

      {isRouletteOpen && (
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
          <div className="roulette-sheet">
            <header className="roulette-header">
              <div>
                <p>A/B 메뉴 룰렛</p>
                <h3 id="roulette-title">오늘은 어디로 갈까요?</h3>
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
              이번에는 한쪽 메뉴에 55~65%의 행운을 줬어요. 어느 쪽이
              유리할지는 룰렛을 열 때마다 바뀝니다.
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
                  결과는{" "}
                  <strong>
                    메뉴 {String.fromCharCode(65 + selectedOption.optionIndex)} · {selectedOption.option.label}
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
              ref={spinButtonRef}
              disabled={isSpinning}
              onClick={spinRoulette}
            >
              {isSpinning
                ? "돌아가는 중…"
                : selectedOption
                  ? "한 번 더 돌리기"
                  : "룰렛 돌리기"}
            </button>
          </div>
        </dialog>
      )}
    </section>
  );
}

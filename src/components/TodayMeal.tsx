import { useEffect, useRef, useState } from "react";

import { getDailyMenuItems, type DailyMeal } from "../data/meals";
import { useMealDecision } from "../hooks/useMealDecision";
import { assessProtein } from "../utils/assessProtein";
import {
  DAY_OF_WEEK_LABELS,
  formatCurrentDate,
  formatMealDate,
} from "../utils/date";
import { MealDecisionPanel } from "./MealDecisionPanel";
import { MealRouletteDialog } from "./MealRouletteDialog";

interface TodayMealProps {
  currentDate: Date;
  todayKey: string;
  meal?: DailyMeal;
  weekMeals: DailyMeal[];
  isWeekend: boolean;
  dataUpdatedAt: string;
}

export function TodayMeal({
  currentDate,
  todayKey,
  meal,
  weekMeals,
  isWeekend,
  dataUpdatedAt,
}: TodayMealProps) {
  const [rouletteMealDate, setRouletteMealDate] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { decision, saveDecision, clearDecision } = useMealDecision({
    meal,
    todayKey,
    dataUpdatedAt,
  });
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
  const selectedOptionIndex = decision?.optionIndex ?? null;
  const selectedOption =
    selectedOptionIndex === null
      ? undefined
      : selectableOptions.find(
          ({ optionIndex }) => optionIndex === selectedOptionIndex,
        );
  const isRouletteOpen = Boolean(
    meal && rouletteMealDate === meal.date,
  );

  useEffect(() => {
    if (rouletteMealDate && rouletteMealDate !== meal?.date) {
      setRouletteMealDate(null);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [meal?.date, rouletteMealDate]);

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
                        {isSelected && <strong>오늘의 픽</strong>}
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
              <MealDecisionPanel
                meal={meal}
                selectedOption={selectedOption}
                triggerRef={triggerRef}
                onOpenRoulette={() => setRouletteMealDate(meal.date)}
                onClear={clearDecision}
              />
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

      {isRouletteOpen && meal && (
        <MealRouletteDialog
          selectableOptions={selectableOptions}
          selectedOption={selectedOption}
          returnFocusRef={triggerRef}
          onSelect={saveDecision}
          onClose={() => setRouletteMealDate(null)}
        />
      )}
    </section>
  );
}

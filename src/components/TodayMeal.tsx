import { useEffect, useRef, useState } from "react";

import {
  getDailyMenuItems,
  type DailyMeal,
  type MealDataStatus,
} from "../data/meals";
import { useMealDecision } from "../hooks/useMealDecision";
import { assessProtein } from "../utils/assessProtein";
import {
  DAY_OF_WEEK_LABELS,
  formatCurrentDate,
  formatMealDate,
  type MealWeekStatus,
} from "../utils/date";
import { MealDecisionPanel } from "./MealDecisionPanel";
import { MealRouletteDialog } from "./MealRouletteDialog";
import { MealUncertaintyDetails } from "./MealUncertaintyDetails";

interface TodayMealProps {
  currentDate: Date;
  todayKey: string;
  meal?: DailyMeal;
  weekMeals: DailyMeal[];
  isWeekend: boolean;
  dataUpdatedAt: string;
  dataStatus: MealDataStatus;
  weekStatus: MealWeekStatus;
  mealWeekRange: string;
}

export function TodayMeal({
  currentDate,
  todayKey,
  meal,
  weekMeals,
  isWeekend,
  dataUpdatedAt,
  dataStatus,
  weekStatus,
  mealWeekRange,
}: TodayMealProps) {
  const [rouletteMealDate, setRouletteMealDate] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isDateVerified = dataStatus === "DATE_VERIFIED";
  const isCurrentWeek = weekStatus === "CURRENT";
  const isSample = dataStatus === "SAMPLE";
  const verifiedMeal = isDateVerified ? meal : undefined;
  const { decision, saveDecision, clearDecision } = useMealDecision({
    meal: verifiedMeal,
    todayKey,
    dataUpdatedAt,
  });
  const menuItems = verifiedMeal ? getDailyMenuItems(verifiedMeal) : [];
  const assessment = assessProtein(
    menuItems,
    verifiedMeal?.uncertainTexts ?? [],
  );
  const proteinItems =
    assessment.matchedMenuItems.length > 0
      ? assessment.matchedMenuItems
      : assessment.possibleMenuItems;
  const matchedProteinItems = new Set(assessment.matchedMenuItems);
  const selectableOptions =
    verifiedMeal?.mealOptions
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
    verifiedMeal && rouletteMealDate === verifiedMeal.date,
  );

  useEffect(() => {
    if (rouletteMealDate && rouletteMealDate !== verifiedMeal?.date) {
      setRouletteMealDate(null);
      window.requestAnimationFrame(() =>
        (triggerRef.current ?? headingRef.current)?.focus(),
      );
    }
  }, [verifiedMeal?.date, rouletteMealDate]);

  return (
    <section
      id="today-section"
      className="today-section"
      aria-labelledby="today-heading"
      tabIndex={-1}
    >
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">점심</p>
          <h2 id="today-heading" ref={headingRef} tabIndex={-1}>
            {isDateVerified
              ? isCurrentWeek
                ? "오늘의 메뉴"
                : "이번 주 식단 준비 중"
              : isSample
                ? "샘플 식단 안내"
                : "식단 확인 상태"}
          </h2>
        </div>
        {isDateVerified && isCurrentWeek && (
          <time
            className="section-date"
            dateTime={verifiedMeal?.date ?? todayKey}
          >
            {verifiedMeal && !isWeekend
              ? formatMealDate(verifiedMeal.date, verifiedMeal.dayOfWeek)
              : formatCurrentDate(currentDate)}
          </time>
        )}
      </div>

      {isDateVerified && isCurrentWeek && (
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
      )}

      <div className="today-card">
        {!isDateVerified ? (
          <div
            className={`empty-state ${isSample ? "empty-state--sample" : "empty-state--verification"}`}
          >
            <strong>
              {isSample
                ? "실제 오늘 식단이 아닌 샘플이에요"
                : "오늘 식단으로 확정할 수 없어요"}
            </strong>
            <p>
              {isSample
                ? "화면 구성 확인용 데이터라 오늘 날짜와 연결하지 않았어요."
                : "원본 사진에서 날짜를 확인할 수 없어 아래 메뉴를 특정 요일 식단으로 단정하지 않았어요."}
            </p>
          </div>
        ) : !isCurrentWeek ? (
          <div className="empty-state empty-state--freshness">
            <strong>
              {weekStatus === "PAST"
                ? "현재 확인된 최신 식단"
                : "예정된 식단을 미리 확인해보세요"}
            </strong>
            <p>
              {weekStatus === "PAST"
                ? `${mealWeekRange} 식단을 아래에서 볼 수 있어요.`
                : `${mealWeekRange} 식단을 미리 확인할 수 있어요.`}
            </p>
          </div>
        ) : isWeekend ? (
          <div className="empty-state">
            <time className="empty-state-date" dateTime={todayKey}>
              {formatCurrentDate(currentDate)}
            </time>
            <strong>오늘은 등록된 점심 식단이 없어요</strong>
            <p>아래에서 이번 주 식단을 다시 확인할 수 있어요.</p>
          </div>
        ) : !verifiedMeal || menuItems.length === 0 ? (
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
              {verifiedMeal.mealOptions.map((option, optionIndex) => {
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

            <MealUncertaintyDetails texts={verifiedMeal.uncertainTexts} />

            {selectableOptions.length === 2 && (
              <MealDecisionPanel
                meal={verifiedMeal}
                selectedOption={selectedOption}
                triggerRef={triggerRef}
                onOpenRoulette={() => setRouletteMealDate(verifiedMeal.date)}
                onClear={clearDecision}
              />
            )}

            <div className="protein-summary">
              <div className="protein-heading">
                <p className="protein-heading-label">메뉴명 관련 키워드</p>
                <p
                  className={`protein-status protein-status--${assessment.status.toLowerCase()}`}
                >
                  <span className="protein-status-dot" aria-hidden="true" />
                  {assessment.label}
                </p>
              </div>
              {proteinItems.length > 0 && (
                <div className="protein-items">
                  <span className="protein-items-label">키워드가 포함된 메뉴</span>
                  <ul>
                    {proteinItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="protein-note">
                메뉴명에 관련 키워드가 포함됐는지만 표시하며, 영양 성분이나
                실제 단백질 함량을 판단하지 않습니다.
              </p>
            </div>
          </>
        )}
      </div>

      {isDateVerified && isRouletteOpen && verifiedMeal && (
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

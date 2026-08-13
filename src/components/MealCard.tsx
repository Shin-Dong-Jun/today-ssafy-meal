import {
  getDailyMenuItems,
  type DailyMeal,
  type MealDataStatus,
} from "../data/meals";
import { DAY_OF_WEEK_LABELS } from "../utils/date";
import { MealUncertaintyDetails } from "./MealUncertaintyDetails";

interface MealCardProps {
  meal: DailyMeal;
  mealIndex: number;
  dataStatus: MealDataStatus;
  isToday: boolean;
}

export function MealCard({
  meal,
  mealIndex,
  dataStatus,
  isToday,
}: MealCardProps) {
  const isDateVerified = dataStatus === "DATE_VERIFIED";
  const isSample = dataStatus === "SAMPLE";
  const menuItems = getDailyMenuItems(meal);
  const [, month, day] = meal.date.split("-").map(Number);
  const dayLabel = DAY_OF_WEEK_LABELS[meal.dayOfWeek];
  const shouldMarkToday = isDateVerified && isToday;
  const mealTargetId = isDateVerified
    ? `meal-${meal.date}`
    : `meal-slot-${mealIndex + 1}`;
  const mealHeadingId = `${mealTargetId}-heading`;

  return (
    <article
      className={`meal-card${shouldMarkToday ? " meal-card--today" : ""}`}
      id={mealTargetId}
      aria-labelledby={mealHeadingId}
      aria-current={shouldMarkToday ? "date" : undefined}
      tabIndex={-1}
    >
      <header className="meal-card-header">
        <h3 id={mealHeadingId}>
          {isDateVerified ? (
            <time dateTime={meal.date}>
              <span className="meal-weekday">{dayLabel}</span>
              <span className="meal-date-short">
                {month}월 {day}일
              </span>
            </time>
          ) : (
            <span className="meal-weekday">
              {isSample ? "예시" : "식단"} {mealIndex + 1}
            </span>
          )}
        </h3>
        {shouldMarkToday && <span className="card-today-label">오늘</span>}
      </header>

      <div className="meal-card-body">
        {menuItems.length > 0 ? (
          <div className="weekly-menu-groups">
            {meal.mealOptions.map((option) => (
              <section className="weekly-menu-group" key={option.label}>
                <h4>{option.label}</h4>
                <ul className="weekly-menu-list">
                  {option.menuItems.map((item, itemIndex) => (
                    <li key={`${option.label}-${itemIndex}`}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <p className="meal-empty">등록된 식단이 없어요</p>
        )}

        <MealUncertaintyDetails texts={meal.uncertainTexts} />
      </div>
    </article>
  );
}

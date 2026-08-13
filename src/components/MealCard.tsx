import { getDailyMenuItems, type DailyMeal } from "../data/meals";
import { DAY_OF_WEEK_LABELS } from "../utils/date";
import { MealUncertaintyDetails } from "./MealUncertaintyDetails";

interface MealCardProps {
  meal: DailyMeal;
  mealIndex: number;
  isDateVerified: boolean;
  isToday: boolean;
}

export function MealCard({
  meal,
  mealIndex,
  isDateVerified,
  isToday,
}: MealCardProps) {
  const menuItems = getDailyMenuItems(meal);
  const [, month, day] = meal.date.split("-").map(Number);
  const dayLabel = DAY_OF_WEEK_LABELS[meal.dayOfWeek];
  const shouldMarkToday = isDateVerified && isToday;

  return (
    <article
      className={`meal-card${shouldMarkToday ? " meal-card--today" : ""}`}
      id={isDateVerified ? `meal-${meal.date}` : `meal-slot-${mealIndex + 1}`}
      aria-current={shouldMarkToday ? "date" : undefined}
    >
      <header className="meal-card-header">
        <h3>
          {isDateVerified ? (
            <time dateTime={meal.date}>
              <span className="meal-weekday">{dayLabel}</span>
              <span className="meal-date-short">
                {month}월 {day}일
              </span>
            </time>
          ) : (
            <span className="meal-weekday">식단 {mealIndex + 1}</span>
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

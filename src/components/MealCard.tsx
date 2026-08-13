import { getDailyMenuItems, type DailyMeal } from "../data/meals";
import { DAY_OF_WEEK_LABELS } from "../utils/date";

interface MealCardProps {
  meal: DailyMeal;
  isToday: boolean;
}

export function MealCard({ meal, isToday }: MealCardProps) {
  const menuItems = getDailyMenuItems(meal);
  const [, month, day] = meal.date.split("-").map(Number);
  const dayLabel = DAY_OF_WEEK_LABELS[meal.dayOfWeek];

  return (
    <article
      className={`meal-card${isToday ? " meal-card--today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      <header className="meal-card-header">
        <h3>
          <time dateTime={meal.date}>
            <span className="meal-weekday">{dayLabel}</span>
            <span className="meal-date-short">
              {month}월 {day}일
            </span>
          </time>
        </h3>
        {isToday && <span className="card-today-label">오늘</span>}
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

        {meal.uncertainTexts.length > 0 && (
          <details className="uncertainty-note">
            <summary>
              사진 판독 확인이 필요한 내용
              <span>{meal.uncertainTexts.length}</span>
            </summary>
            <ul>
              {meal.uncertainTexts.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}

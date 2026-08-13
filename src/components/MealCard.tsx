import type { DailyMeal } from "../data/meals";
import { formatMealDate } from "../utils/date";

interface MealCardProps {
  meal: DailyMeal;
  isToday: boolean;
}

export function MealCard({ meal, isToday }: MealCardProps) {
  return (
    <article
      className={`meal-card${isToday ? " meal-card--today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      <header className="meal-card-header">
        <h3>
          <time dateTime={meal.date}>
            {formatMealDate(meal.date, meal.dayOfWeek)}
          </time>
        </h3>
        {isToday && <span className="card-today-label">오늘</span>}
      </header>

      {meal.menuItems.length > 0 ? (
        <ul className="weekly-menu-list">
          {meal.menuItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="meal-empty">등록된 식단이 없어요</p>
      )}

      {meal.uncertainTexts.length > 0 && (
        <aside className="uncertainty-note" aria-label="확인이 필요한 내용">
          <strong>확인이 필요한 내용</strong>
          <ul>
            {meal.uncertainTexts.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}

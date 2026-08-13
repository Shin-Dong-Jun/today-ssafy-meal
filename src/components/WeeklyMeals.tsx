import type { DailyMeal } from "../data/meals";
import { MealCard } from "./MealCard";

interface WeeklyMealsProps {
  meals: DailyMeal[];
  todayKey: string;
}

export function WeeklyMeals({ meals, todayKey }: WeeklyMealsProps) {
  return (
    <section className="weekly-section" aria-labelledby="weekly-heading">
      <div className="weekly-heading">
        <div>
          <p className="section-kicker">월요일부터 금요일까지</p>
          <h2 id="weekly-heading">이번 주 식단</h2>
        </div>
        <p>총 {meals.length}일</p>
      </div>

      <div className="meal-grid">
        {meals.map((meal) => (
          <MealCard
            key={meal.date}
            meal={meal}
            isToday={meal.date === todayKey}
          />
        ))}
      </div>
    </section>
  );
}

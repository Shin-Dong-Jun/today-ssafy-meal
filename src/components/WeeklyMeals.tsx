import type {
  DailyMeal,
  MealDataStatus,
} from "../data/meals";
import { MealCard } from "./MealCard";

interface WeeklyMealsProps {
  meals: DailyMeal[];
  todayKey: string;
  dataStatus: MealDataStatus;
}

export function WeeklyMeals({
  meals,
  todayKey,
  dataStatus,
}: WeeklyMealsProps) {
  const isDateVerified = dataStatus === "DATE_VERIFIED";

  return (
    <section
      id="weekly-section"
      className="weekly-section"
      aria-labelledby="weekly-heading"
    >
      <div className="weekly-heading">
        <div>
          <h2 id="weekly-heading">
            {isDateVerified
              ? "이번 주 식단"
              : dataStatus === "SAMPLE"
                ? "샘플 식단"
                : "사진 판독 식단"}
          </h2>
        </div>
        <p>
          {isDateVerified
            ? `평일 ${meals.length}일`
            : `식단 ${meals.length}개`}
        </p>
      </div>

      <div className="meal-list">
        {meals.map((meal, mealIndex) => (
          <MealCard
            key={meal.date}
            meal={meal}
            mealIndex={mealIndex}
            isDateVerified={isDateVerified}
            isToday={isDateVerified && meal.date === todayKey}
          />
        ))}
      </div>
    </section>
  );
}

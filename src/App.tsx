import { useMemo } from "react";

import { MealDataNotice } from "./components/MealDataNotice";
import { MealNavigator } from "./components/MealNavigator";
import { buildMealNavigatorModel } from "./components/mealNavigatorModel";
import { SiteHeader } from "./components/SiteHeader";
import { TodayMeal } from "./components/TodayMeal";
import { WeeklyMeals } from "./components/WeeklyMeals";
import { weeklyMeal, type WeeklyMeal } from "./data/meals";
import { useSeoulCurrentDate } from "./hooks/useSeoulCurrentDate";
import {
  buildWeekdayMealSlots,
  formatMealWeekRange,
  getMealWeekStatus,
  getSeoulDateKey,
  isSeoulWeekend,
} from "./utils/date";

interface AppProps {
  mealData?: WeeklyMeal;
}

function App({ mealData = weeklyMeal }: AppProps) {
  const currentDate = useSeoulCurrentDate();
  const todayKey = getSeoulDateKey(currentDate);
  const isDateVerified = mealData.status === "DATE_VERIFIED";
  const todayMeal = isDateVerified
    ? mealData.meals.find((meal) => meal.date === todayKey)
    : undefined;
  const weekdayMeals = useMemo(
    () => buildWeekdayMealSlots(mealData),
    [mealData],
  );
  const mealWeekStatus = getMealWeekStatus(mealData.weekStart, currentDate);
  const mealWeekRange = formatMealWeekRange(mealData.weekStart);
  const mealNavigatorModel = useMemo(
    () =>
      buildMealNavigatorModel(mealData, mealWeekStatus, weekdayMeals),
    [mealData, mealWeekStatus, weekdayMeals],
  );

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        식단 내용으로 바로가기
      </a>

      <SiteHeader currentDate={currentDate} updatedAt={mealData.updatedAt} />

      <MealDataNotice
        weeklyMeal={mealData}
        currentDate={currentDate}
        weekStatus={mealWeekStatus}
      />

      <MealNavigator
        items={mealNavigatorModel.items}
        ariaLabel={mealNavigatorModel.ariaLabel}
      />

      <main id="main-content">
        <div
          className={`main-container${isDateVerified ? "" : " main-container--menu-first"}`}
        >
          {isDateVerified && (
            <TodayMeal
              currentDate={currentDate}
              todayKey={todayKey}
              meal={todayMeal}
              isWeekend={isSeoulWeekend(currentDate)}
              dataUpdatedAt={mealData.updatedAt}
              dataStatus={mealData.status}
              weekStatus={mealWeekStatus}
              mealWeekRange={mealWeekRange}
            />
          )}

          <WeeklyMeals
            meals={weekdayMeals}
            todayKey={todayKey}
            dataStatus={mealData.status}
            weekStatus={mealWeekStatus}
          />
        </div>
      </main>

      <footer className="site-footer">
        <strong>오늘 싸피밥</strong>
        <p>
          SSAFY 공식 서비스가 아닌 대전캠퍼스 교육생 개인 제작 서비스입니다.
        </p>
      </footer>
    </div>
  );
}

export default App;

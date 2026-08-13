import { MealDataNotice } from "./components/MealDataNotice";
import { MobileQuickNav } from "./components/MobileQuickNav";
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
  const weekdayMeals = buildWeekdayMealSlots(mealData);
  const mealWeekStatus = getMealWeekStatus(mealData.weekStart, currentDate);
  const mealWeekRange = formatMealWeekRange(mealData.weekStart);

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

      <main id="main-content">
        <div className="main-container">
          <TodayMeal
            currentDate={currentDate}
            todayKey={todayKey}
            meal={todayMeal}
            weekMeals={weekdayMeals}
            isWeekend={isSeoulWeekend(currentDate)}
            dataUpdatedAt={mealData.updatedAt}
            dataStatus={mealData.status}
            weekStatus={mealWeekStatus}
            mealWeekRange={mealWeekRange}
          />

          <WeeklyMeals
            meals={weekdayMeals}
            todayKey={todayKey}
            dataStatus={mealData.status}
            weekStatus={mealWeekStatus}
          />
        </div>
      </main>

      <MobileQuickNav
        todayLabel={
          isDateVerified
            ? mealWeekStatus === "CURRENT"
              ? "오늘"
              : "이번 주 안내"
            : mealData.status === "SAMPLE"
              ? "샘플 안내"
              : "확인 상태"
        }
        weeklyLabel={
          isDateVerified
            ? mealWeekStatus === "PAST"
              ? "지난 식단"
              : mealWeekStatus === "FUTURE"
                ? "예정 식단"
                : "이번 주"
            : mealData.status === "SAMPLE"
              ? "샘플 식단"
              : "판독 식단"
        }
      />

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

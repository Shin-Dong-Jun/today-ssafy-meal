import { SiteHeader } from "./components/SiteHeader";
import { TodayMeal } from "./components/TodayMeal";
import { WeeklyMeals } from "./components/WeeklyMeals";
import { weeklyMeal } from "./data/meals";
import {
  buildWeekdayMealSlots,
  getSeoulDateKey,
  isSeoulWeekend,
} from "./utils/date";

function App() {
  const currentDate = new Date();
  const todayKey = getSeoulDateKey(currentDate);
  const todayMeal = weeklyMeal.meals.find((meal) => meal.date === todayKey);
  const weekdayMeals = buildWeekdayMealSlots(weeklyMeal);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        식단 내용으로 바로가기
      </a>

      {weeklyMeal.isSample && (
        <div className="sample-banner" role="status">
          <strong>현재 화면은 샘플 식단입니다.</strong>
          <span>실제 SSAFY 대전캠퍼스 식단이 아닙니다.</span>
        </div>
      )}

      <SiteHeader
        currentDate={currentDate}
        updatedAt={weeklyMeal.updatedAt}
      />

      <main id="main-content">
        {weeklyMeal.sourceNotes.length > 0 && (
          <aside className="source-note" aria-label="식단표 판독 안내">
            <strong>식단표 판독 안내</strong>
            <ul>
              {weeklyMeal.sourceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </aside>
        )}
        <TodayMeal
          meal={todayMeal}
          isWeekend={isSeoulWeekend(currentDate)}
        />
        <WeeklyMeals meals={weekdayMeals} todayKey={todayKey} />
      </main>

      <footer>
        SSAFY 공식 서비스가 아닌 대전캠퍼스 교육생 개인 제작 서비스입니다.
      </footer>
    </div>
  );
}

export default App;

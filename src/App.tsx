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

      <SiteHeader
        currentDate={currentDate}
        todayKey={todayKey}
        updatedAt={weeklyMeal.updatedAt}
      />

      {weeklyMeal.isSample && (
        <aside className="sample-banner" aria-label="샘플 식단 안내">
          <span className="sample-banner-mark" aria-hidden="true" />
          <div>
            <strong>현재 화면은 샘플 식단입니다.</strong>
            <span>실제 SSAFY 대전캠퍼스 식단이 아닙니다.</span>
          </div>
        </aside>
      )}

      <main id="main-content">
        <div className="content-layout">
          <div className="today-column">
            <TodayMeal
              currentDate={currentDate}
              todayKey={todayKey}
              meal={todayMeal}
              isWeekend={isSeoulWeekend(currentDate)}
            />

            {weeklyMeal.sourceNotes.length > 0 && (
              <aside className="source-note" aria-label="식단표 원본 판독 안내">
                <p className="source-note-heading">
                  <span>식단표 원본 판독 안내</span>
                  <span className="source-note-count">
                    {weeklyMeal.sourceNotes.length}건
                  </span>
                </p>
                <ul>
                  {weeklyMeal.sourceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
          <WeeklyMeals meals={weekdayMeals} todayKey={todayKey} />
        </div>
      </main>

      <footer>
        <p>
          SSAFY 공식 서비스가 아닌 대전캠퍼스 교육생 개인 제작 서비스입니다.
        </p>
      </footer>
    </div>
  );
}

export default App;

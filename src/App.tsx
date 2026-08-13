import { SiteHeader } from "./components/SiteHeader";
import { TodayMeal } from "./components/TodayMeal";
import { WeeklyMeals } from "./components/WeeklyMeals";
import { weeklyMeal } from "./data/meals";
import {
  buildWeekdayMealSlots,
  formatMealWeekRange,
  getMealWeekStatus,
  getSeoulDateKey,
  isSeoulWeekend,
} from "./utils/date";

function App() {
  const currentDate = new Date();
  const todayKey = getSeoulDateKey(currentDate);
  const todayMeal = weeklyMeal.meals.find((meal) => meal.date === todayKey);
  const weekdayMeals = buildWeekdayMealSlots(weeklyMeal);
  const mealWeekStatus = getMealWeekStatus(weeklyMeal.weekStart, currentDate);
  const mealWeekRange = formatMealWeekRange(weeklyMeal.weekStart);

  return (
    <div className="page-shell">
      <a className="skip-link" href="#main-content">
        식단 내용으로 바로가기
      </a>

      <SiteHeader currentDate={currentDate} updatedAt={weeklyMeal.updatedAt} />

      {weeklyMeal.isSample && (
        <aside className="sample-banner" aria-label="샘플 식단 안내">
          <span className="sample-banner-mark" aria-hidden="true" />
          <div>
            <strong>현재 화면은 샘플 식단입니다.</strong>
            <span>실제 SSAFY 대전캠퍼스 식단이 아닙니다.</span>
          </div>
        </aside>
      )}

      {mealWeekStatus !== "CURRENT" && (
        <aside
          className={`week-status-banner week-status-banner--${mealWeekStatus.toLowerCase()}`}
          aria-label="식단 주차 안내"
        >
          <span className="week-status-mark" aria-hidden="true" />
          <div>
            <strong>
              {mealWeekStatus === "PAST"
                ? "이번 주 식단이 아직 갱신되지 않았어요."
                : "다음 주 식단을 미리 표시하고 있어요."}
            </strong>
            <span>{mealWeekRange} 식단을 보여주고 있습니다.</span>
          </div>
        </aside>
      )}

      <main id="main-content">
        <div className="main-container">
          <TodayMeal
            currentDate={currentDate}
            todayKey={todayKey}
            meal={todayMeal}
            weekMeals={weekdayMeals}
            isWeekend={isSeoulWeekend(currentDate)}
          />

          {weeklyMeal.sourceNotes.length > 0 && (
            <aside
              className="source-note"
              id="source-notes"
              aria-label="식단표 원본 판독 안내"
            >
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

          <WeeklyMeals meals={weekdayMeals} todayKey={todayKey} />
        </div>
      </main>

      <nav className="mobile-quick-nav" aria-label="페이지 바로가기">
        <a href="#today-heading" aria-current="page">
          <span aria-hidden="true" />
          오늘
        </a>
        <a href="#weekly-heading">
          <span aria-hidden="true" />
          이번 주
        </a>
        {weeklyMeal.sourceNotes.length > 0 && (
          <a href="#source-notes">
            <span aria-hidden="true" />
            판독 안내
          </a>
        )}
      </nav>

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

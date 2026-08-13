import type { DailyMeal } from "../data/meals";
import { assessProtein } from "../utils/assessProtein";
import { formatMealDate } from "../utils/date";

interface TodayMealProps {
  meal?: DailyMeal;
  isWeekend: boolean;
}

export function TodayMeal({ meal, isWeekend }: TodayMealProps) {
  const assessment = assessProtein(
    meal?.menuItems ?? [],
    meal?.uncertainTexts ?? [],
  );
  const proteinItems =
    assessment.matchedMenuItems.length > 0
      ? assessment.matchedMenuItems
      : assessment.possibleMenuItems;

  return (
    <section className="today-section" aria-labelledby="today-heading">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">가장 먼저 확인하세요</p>
          <h2 id="today-heading">오늘의 점심</h2>
        </div>
        {meal && <span className="today-label">오늘</span>}
      </div>

      <div className="today-card">
        {isWeekend ? (
          <div className="empty-state">
            <strong>오늘은 등록된 점심 식단이 없어요</strong>
            <p>아래에서 이번 주 식단을 다시 확인할 수 있어요.</p>
          </div>
        ) : !meal || meal.menuItems.length === 0 ? (
          <div className="empty-state">
            <strong>오늘 식단이 아직 등록되지 않았어요</strong>
            <p>식단표가 확인되면 정적 데이터를 업데이트할 예정이에요.</p>
          </div>
        ) : (
          <>
            <p className="today-date">
              <time dateTime={meal.date}>
                {formatMealDate(meal.date, meal.dayOfWeek)}
              </time>
            </p>
            <ul className="today-menu-list" aria-label="오늘 메뉴">
              {meal.menuItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="protein-summary">
              <p
                className={`protein-status protein-status--${assessment.status.toLowerCase()}`}
              >
                {assessment.label}
              </p>
              {proteinItems.length > 0 && (
                <p className="protein-items">
                  <span>
                    {assessment.status === "POSSIBLE"
                      ? "가능성이 있는 항목"
                      : "판정된 메뉴"}
                  </span>
                  {proteinItems.join(", ")}
                </p>
              )}
              <p className="protein-note">
                메뉴명만을 기준으로 한 대략적인 판단이며 실제 재료와 제공량에
                따라 다를 수 있습니다.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

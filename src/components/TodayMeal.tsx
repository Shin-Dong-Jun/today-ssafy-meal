import { getDailyMenuItems, type DailyMeal } from "../data/meals";
import { assessProtein } from "../utils/assessProtein";
import { formatCurrentDate, formatMealDate } from "../utils/date";

interface TodayMealProps {
  currentDate: Date;
  todayKey: string;
  meal?: DailyMeal;
  isWeekend: boolean;
}

export function TodayMeal({
  currentDate,
  todayKey,
  meal,
  isWeekend,
}: TodayMealProps) {
  const menuItems = meal ? getDailyMenuItems(meal) : [];
  const assessment = assessProtein(
    menuItems,
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
          <p className="section-kicker">Today · Lunch</p>
          <h2 id="today-heading">오늘의 점심</h2>
        </div>
        {meal && !isWeekend && (
          <time className="section-date" dateTime={meal.date}>
            {formatMealDate(meal.date, meal.dayOfWeek)}
          </time>
        )}
      </div>

      <div className="today-card">
        {isWeekend ? (
          <div className="empty-state">
            <time className="empty-state-date" dateTime={todayKey}>
              {formatCurrentDate(currentDate)}
            </time>
            <strong>오늘은 등록된 점심 식단이 없어요</strong>
            <p>아래에서 이번 주 식단을 다시 확인할 수 있어요.</p>
          </div>
        ) : !meal || menuItems.length === 0 ? (
          <div className="empty-state">
            <time className="empty-state-date" dateTime={todayKey}>
              {formatCurrentDate(currentDate)}
            </time>
            <strong>오늘 식단이 아직 등록되지 않았어요</strong>
            <p>식단표가 확인되면 정적 데이터를 업데이트할 예정이에요.</p>
          </div>
        ) : (
          <>
            <div className="today-menu-groups">
              {meal.mealOptions.map((option, optionIndex) => (
                <section className="today-menu-group" key={option.label}>
                  <header className="menu-group-heading">
                    <span aria-hidden="true">
                      {String(optionIndex + 1).padStart(2, "0")}
                    </span>
                    <h3>{option.label}</h3>
                  </header>
                  <ul className="today-menu-list">
                    {option.menuItems.map((item, itemIndex) => (
                      <li key={`${option.label}-${itemIndex}`}>
                        <span className="menu-item-marker" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="protein-summary">
              <div className="protein-heading">
                <p className="protein-heading-label">메뉴명 기준 단백질 체크</p>
                <p
                  className={`protein-status protein-status--${assessment.status.toLowerCase()}`}
                >
                  <span className="protein-status-dot" aria-hidden="true" />
                  {assessment.label}
                </p>
              </div>
              {proteinItems.length > 0 && (
                <div className="protein-items">
                  <span className="protein-items-label">
                    {assessment.status === "POSSIBLE"
                      ? "가능성이 있는 항목"
                      : "판정된 메뉴"}
                  </span>
                  <ul>
                    {proteinItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
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

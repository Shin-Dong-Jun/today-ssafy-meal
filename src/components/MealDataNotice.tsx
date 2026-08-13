import type {
  MealDataStatus,
  WeeklyMeal,
} from "../data/meals";
import {
  formatMealWeekRange,
  formatUpdatedAtCompact,
} from "../utils/date";

interface MealDataNoticeProps {
  weeklyMeal: WeeklyMeal;
  currentDate: Date;
}

const STATUS_LABELS: Record<MealDataStatus, string> = {
  DATE_VERIFIED: "날짜 확인",
  DATE_UNVERIFIED: "날짜 미확인",
  SAMPLE: "샘플",
};

const STATUS_MESSAGES: Record<MealDataStatus, string> = {
  DATE_VERIFIED: "식단표의 실제 날짜를 확인했어요.",
  DATE_UNVERIFIED:
    "확인 가능한 메뉴만 옮겼지만 날짜는 확인되지 않았어요.",
  SAMPLE: "실제 SSAFY 식단이 아닌 샘플 데이터예요.",
};

export function MealDataNotice({
  weeklyMeal,
  currentDate,
}: MealDataNoticeProps) {
  const status = weeklyMeal.status;
  const statusClass = status.toLowerCase().replaceAll("_", "-");
  const titleId = "meal-data-notice-title";

  return (
    <aside
      className={`meal-data-notice meal-data-notice--${statusClass}`}
      aria-labelledby={titleId}
    >
      <div className="meal-data-notice-heading">
        <span className="meal-data-status">{STATUS_LABELS[status]}</span>
        <strong id={titleId}>{STATUS_MESSAGES[status]}</strong>
      </div>

      <dl className="meal-data-meta">
        <div>
          <dt>
            {status === "DATE_UNVERIFIED" ? "임시 표시 기간" : "표시 기간"}
          </dt>
          <dd>{formatMealWeekRange(weeklyMeal.weekStart)}</dd>
        </div>
        <div>
          <dt>데이터 반영</dt>
          <dd>
            <time dateTime={weeklyMeal.updatedAt}>
              {formatUpdatedAtCompact(weeklyMeal.updatedAt, currentDate)}
            </time>
          </dd>
        </div>
      </dl>

      {weeklyMeal.sourceNotes.length > 0 && (
        <details className="meal-data-source-notes">
          <summary>판독 및 출처 안내 {weeklyMeal.sourceNotes.length}개</summary>
          <ul>
            {weeklyMeal.sourceNotes.map((note, index) => (
              <li key={`${index}-${note}`}>{note}</li>
            ))}
          </ul>
        </details>
      )}
    </aside>
  );
}

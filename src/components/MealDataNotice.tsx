import type {
  MealDataStatus,
  WeeklyMeal,
} from "../data/meals";
import {
  formatMealWeekRange,
  formatUpdatedAtCompact,
  type MealWeekStatus,
} from "../utils/date";

interface MealDataNoticeProps {
  weeklyMeal: WeeklyMeal;
  currentDate: Date;
  weekStatus: MealWeekStatus;
}

const STATUS_LABELS: Record<MealDataStatus, string> = {
  DATE_VERIFIED: "날짜 확인",
  DATE_UNVERIFIED: "날짜 미확인",
  SAMPLE: "샘플",
};

const STATUS_MESSAGES: Record<MealDataStatus, string> = {
  DATE_VERIFIED: "식단표의 실제 날짜를 확인했어요.",
  DATE_UNVERIFIED:
    "날짜는 확인하지 못했어요. 사진에서 읽은 메뉴만 순서대로 보여드려요.",
  SAMPLE: "실제 SSAFY 식단이 아닌 화면 확인용 예시예요.",
};

const FRESHNESS_LABELS: Record<Exclude<MealWeekStatus, "CURRENT">, string> = {
  PAST: "지난 식단",
  FUTURE: "예정 식단",
};

export function MealDataNotice({
  weeklyMeal,
  currentDate,
  weekStatus,
}: MealDataNoticeProps) {
  const status = weeklyMeal.status;
  const statusClass = status.toLowerCase().replaceAll("_", "-");
  const freshnessStatus =
    status === "DATE_VERIFIED" && weekStatus !== "CURRENT"
      ? weekStatus
      : null;
  const freshnessClass = freshnessStatus?.toLowerCase();
  const mealWeekRange = formatMealWeekRange(weeklyMeal.weekStart);
  const title =
    freshnessStatus === "PAST"
      ? `${mealWeekRange} 식단을 표시하고 있어요.`
      : freshnessStatus === "FUTURE"
        ? `${mealWeekRange} 식단을 미리 표시하고 있어요.`
        : STATUS_MESSAGES[status];
  const titleId = "meal-data-notice-title";

  return (
    <aside
      id="meal-data-notice"
      className={`meal-data-notice meal-data-notice--${statusClass}${freshnessClass ? ` meal-data-notice--${freshnessClass}` : ""}`}
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <div className="meal-data-notice-heading">
        <div className="meal-data-statuses">
          {freshnessStatus && (
            <span
              className={`meal-data-freshness meal-data-freshness--${freshnessClass}`}
            >
              {FRESHNESS_LABELS[freshnessStatus]}
            </span>
          )}
          <span className="meal-data-status">{STATUS_LABELS[status]}</span>
        </div>
        <div className="meal-data-notice-copy">
          <strong id={titleId}>{title}</strong>
          {freshnessStatus && (
            <p>
              {freshnessStatus === "PAST"
                ? "이번 주 식단은 아직 등록되지 않았어요."
                : "해당 기간이 시작되기 전에 미리 확인하고 있어요."}
            </p>
          )}
        </div>
      </div>

      <dl className="meal-data-meta">
        {status !== "DATE_UNVERIFIED" && (
          <div>
            <dt>{status === "SAMPLE" ? "예시 기간" : "표시 기간"}</dt>
            <dd>{mealWeekRange}</dd>
          </div>
        )}
        <div>
          <dt>{status === "SAMPLE" ? "예시 반영" : "데이터 반영"}</dt>
          <dd>
            <time dateTime={weeklyMeal.updatedAt}>
              {formatUpdatedAtCompact(weeklyMeal.updatedAt, currentDate)}
            </time>
          </dd>
        </div>
      </dl>

      {weeklyMeal.sourceNotes.length > 0 && (
        <details className="meal-data-source-notes">
          <summary>
            {status === "DATE_UNVERIFIED"
              ? "날짜·판독 근거"
              : status === "SAMPLE"
                ? "예시 및 출처 안내"
                : "판독 및 출처 안내"}{" "}
            {weeklyMeal.sourceNotes.length}개
          </summary>
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

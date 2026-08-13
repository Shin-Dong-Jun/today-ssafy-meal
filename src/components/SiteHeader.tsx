import { formatCurrentDate, formatUpdatedAt } from "../utils/date";

interface SiteHeaderProps {
  currentDate: Date;
  todayKey: string;
  updatedAt: string;
}

export function SiteHeader({
  currentDate,
  todayKey,
  updatedAt,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="brand-lockup">
        <p className="campus-label">SSAFY 대전캠퍼스</p>
        <h1>오늘 싸피밥</h1>
      </div>

      <div className="header-date">
        <span className="header-date-label">오늘</span>
        <time className="header-today" dateTime={todayKey}>
          {formatCurrentDate(currentDate)}
        </time>
        <p className="update-time">
          <span>마지막 업데이트</span>
          <time dateTime={updatedAt}>{formatUpdatedAt(updatedAt)}</time>
        </p>
      </div>
    </header>
  );
}

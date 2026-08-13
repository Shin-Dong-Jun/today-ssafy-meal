import { formatCurrentDate, formatUpdatedAt } from "../utils/date";

interface SiteHeaderProps {
  currentDate: Date;
  updatedAt: string;
}

export function SiteHeader({ currentDate, updatedAt }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <p className="eyebrow">SSAFY DAEJEON · LUNCH</p>
      <h1>오늘 싸피밥</h1>
      <p className="service-description">SSAFY 대전캠퍼스 이번 주 점심</p>

      <dl className="date-summary">
        <div>
          <dt>오늘</dt>
          <dd>
            <time dateTime={currentDate.toISOString()}>
              {formatCurrentDate(currentDate)}
            </time>
          </dd>
        </div>
        <div>
          <dt>마지막 업데이트</dt>
          <dd>
            <time dateTime={updatedAt}>{formatUpdatedAt(updatedAt)}</time>
          </dd>
        </div>
      </dl>
    </header>
  );
}

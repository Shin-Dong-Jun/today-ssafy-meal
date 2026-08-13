import { formatUpdatedAt } from "../utils/date";

interface SiteHeaderProps {
  updatedAt: string;
}

export function SiteHeader({ updatedAt }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-lockup">
          <h1>오늘 싸피밥</h1>
          <span className="campus-badge">대전캠퍼스</span>
        </div>

        <nav className="desktop-primary-nav" aria-label="주요 메뉴">
          <a href="#main-content" aria-current="page">
            식단표
          </a>
        </nav>

        <p className="update-time">
          <span>마지막 업데이트</span>
          <time dateTime={updatedAt}>{formatUpdatedAt(updatedAt)}</time>
        </p>
      </div>
    </header>
  );
}

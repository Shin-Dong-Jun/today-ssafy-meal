import { useEffect, useState } from "react";

const SECTION_IDS = ["today-section", "weekly-section"] as const;

type SectionId = (typeof SECTION_IDS)[number];

interface MobileQuickNavProps {
  todayLabel?: string;
  weeklyLabel?: string;
}

function getInitialSection(): SectionId {
  if (
    typeof window !== "undefined" &&
    window.location.hash === "#weekly-section"
  ) {
    return "weekly-section";
  }

  return "today-section";
}

export function MobileQuickNav({
  todayLabel = "오늘",
  weeklyLabel = "이번 주",
}: MobileQuickNavProps) {
  const [activeSection, setActiveSection] =
    useState<SectionId>(getInitialSection);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const sections = SECTION_IDS.map((sectionId) =>
      document.getElementById(sectionId),
    ).filter((section): section is HTMLElement => section !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              Math.abs(first.boundingClientRect.top) -
              Math.abs(second.boundingClientRect.top),
          )[0];

        if (
          visibleSection &&
          SECTION_IDS.includes(visibleSection.target.id as SectionId)
        ) {
          setActiveSection(visibleSection.target.id as SectionId);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="mobile-quick-nav" aria-label="페이지 바로가기">
      <a
        href="#today-section"
        aria-current={activeSection === "today-section" ? "location" : undefined}
        onClick={() => setActiveSection("today-section")}
      >
        <span aria-hidden="true" />
        {todayLabel}
      </a>
      <a
        href="#weekly-section"
        aria-current={activeSection === "weekly-section" ? "location" : undefined}
        onClick={() => setActiveSection("weekly-section")}
      >
        <span aria-hidden="true" />
        {weeklyLabel}
      </a>
    </nav>
  );
}

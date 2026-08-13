import { useEffect, useState } from "react";

export type MobileQuickNavTargetId =
  | "meal-data-notice"
  | "today-section"
  | "weekly-section";

export interface MobileQuickNavItem {
  targetId: MobileQuickNavTargetId;
  label: string;
}

interface MobileQuickNavProps {
  items: readonly MobileQuickNavItem[];
}

function getInitialSection(
  items: readonly MobileQuickNavItem[],
): MobileQuickNavTargetId | null {
  if (typeof window !== "undefined") {
    const hashTarget = window.location.hash.slice(1);
    const matchingItem = items.find((item) => item.targetId === hashTarget);

    if (matchingItem) {
      return matchingItem.targetId;
    }
  }

  return items[0]?.targetId ?? null;
}

export function MobileQuickNav({ items }: MobileQuickNavProps) {
  const [activeSection, setActiveSection] =
    useState<MobileQuickNavTargetId | null>(() => getInitialSection(items));

  useEffect(() => {
    setActiveSection((currentSection) =>
      items.some((item) => item.targetId === currentSection)
        ? currentSection
        : getInitialSection(items),
    );

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const sections = items.map(({ targetId }) =>
      document.getElementById(targetId),
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

        if (visibleSection) {
          setActiveSection(visibleSection.target.id as MobileQuickNavTargetId);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleNavigation = (targetId: MobileQuickNavTargetId) => {
    setActiveSection(targetId);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus({ preventScroll: true });
    });
  };

  return (
    <nav className="mobile-quick-nav" aria-label="페이지 바로가기">
      {items.map(({ targetId, label }) => (
        <a
          href={`#${targetId}`}
          aria-current={activeSection === targetId ? "location" : undefined}
          onClick={() => handleNavigation(targetId)}
          key={targetId}
        >
          <span aria-hidden="true" />
          {label}
        </a>
      ))}
    </nav>
  );
}

import { useEffect, useRef, useState } from "react";

import type { MealNavigatorItem } from "./mealNavigatorModel";

interface MealNavigatorProps {
  items: readonly MealNavigatorItem[];
  ariaLabel: string;
}

function getInitialTarget(items: readonly MealNavigatorItem[]): string | null {
  if (typeof window !== "undefined") {
    const hashTarget = window.location.hash.slice(1);
    const matchingItem = items.find((item) => item.targetId === hashTarget);

    if (matchingItem) {
      return matchingItem.targetId;
    }
  }

  return items[0]?.targetId ?? null;
}

export function MealNavigator({ items, ariaLabel }: MealNavigatorProps) {
  const [activeTarget, setActiveTarget] = useState<string | null>(() =>
    getInitialTarget(items),
  );
  const navigationLockRef = useRef<string | null>(null);
  const navigatorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveTarget((currentTarget) =>
      items.some((item) => item.targetId === currentTarget)
        ? currentTarget
        : getInitialTarget(items),
    );

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const targets = items
      .map(({ targetId }) => document.getElementById(targetId))
      .filter((target): target is HTMLElement => target !== null);

    if (targets.length === 0) {
      return;
    }

    let animationFrameId: number | null = null;
    const updateActiveTarget = () => {
      animationFrameId = null;

      const viewportHeight = window.innerHeight;
      const navigationTarget = navigationLockRef.current;

      if (navigationTarget) {
        setActiveTarget(navigationTarget);
        return;
      }

      const isAtPageEnd =
        Math.ceil(window.scrollY + viewportHeight) >=
        document.documentElement.scrollHeight - 2;

      if (isAtPageEnd) {
        setActiveTarget(targets.at(-1)?.id ?? null);
        return;
      }

      const navigator = navigatorRef.current;
      const navigatorRect = navigator?.getBoundingClientRect();
      const navigatorPosition = navigator
        ? window.getComputedStyle(navigator).position
        : null;
      const visibleViewportTop =
        navigatorPosition === "sticky" && navigatorRect && navigatorRect.top <= 1
          ? navigatorRect.bottom
          : 0;
      const visibleViewportBottom =
        navigatorPosition === "fixed" && navigatorRect
          ? navigatorRect.top
          : viewportHeight;
      const visibleViewportCenter =
        (visibleViewportTop + visibleViewportBottom) / 2;
      const visibleTargets = targets
        .map((target) => {
          const rect = target.getBoundingClientRect();
          const visibleHeight = Math.max(
            0,
            Math.min(rect.bottom, visibleViewportBottom) -
              Math.max(rect.top, visibleViewportTop),
          );

          return { target, rect, visibleHeight };
        })
        .filter(({ visibleHeight }) => visibleHeight > 0);
      const mostVisibleTarget = visibleTargets.sort(
        (first, second) =>
          second.visibleHeight - first.visibleHeight ||
          Math.abs(
            first.rect.top + first.rect.height / 2 - visibleViewportCenter,
          ) -
            Math.abs(
              second.rect.top + second.rect.height / 2 - visibleViewportCenter,
            ),
      )[0]?.target;

      if (mostVisibleTarget) {
        setActiveTarget(mostVisibleTarget.id);
      }
    };
    const scheduleActiveTargetUpdate = () => {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(updateActiveTarget);
      }
    };
    const handleScroll = () => {
      scheduleActiveTargetUpdate();
    };
    const releaseNavigationLock = () => {
      navigationLockRef.current = null;
      scheduleActiveTargetUpdate();
    };
    const handleScrollKey = (event: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
          event.key,
        )
      ) {
        releaseNavigationLock();
      }
    };
    const handleLocationChange = () => {
      if (window.location.hash.slice(1) !== navigationLockRef.current) {
        releaseNavigationLock();
      }
    };
    const observer = new IntersectionObserver(scheduleActiveTargetUpdate, {
      threshold: [0, 0.5, 1],
    });

    targets.forEach((target) => observer.observe(target));
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("wheel", releaseNavigationLock, { passive: true });
    window.addEventListener("touchstart", releaseNavigationLock, {
      passive: true,
    });
    window.addEventListener("pointerdown", releaseNavigationLock, true);
    window.addEventListener("keydown", handleScrollKey);
    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    scheduleActiveTargetUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", releaseNavigationLock);
      window.removeEventListener("touchstart", releaseNavigationLock);
      window.removeEventListener("pointerdown", releaseNavigationLock, true);
      window.removeEventListener("keydown", handleScrollKey);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      navigationLockRef.current = null;
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const handleNavigation = (targetId: string) => {
    navigationLockRef.current = targetId;
    setActiveTarget(targetId);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus({ preventScroll: true });
    });
  };

  return (
    <nav className="meal-navigator" aria-label={ariaLabel} ref={navigatorRef}>
      <div className="meal-navigator-list">
        {items.map(({ targetId, label, desktopLabel, accessibleLabel }) => (
          <a
            className="meal-navigator-link"
            href={`#${targetId}`}
            aria-label={accessibleLabel}
            aria-current={activeTarget === targetId ? "location" : undefined}
            onClick={() => handleNavigation(targetId)}
            key={targetId}
          >
            <span className="meal-navigator-label meal-navigator-label--mobile">
              {label}
            </span>
            <span className="meal-navigator-label meal-navigator-label--desktop">
              {desktopLabel ?? label}
            </span>
            <i aria-hidden="true" />
          </a>
        ))}
      </div>
    </nav>
  );
}

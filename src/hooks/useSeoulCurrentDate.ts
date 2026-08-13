import { useEffect, useState } from "react";

import { getMillisecondsUntilNextSeoulDay } from "../utils/date";

export function useSeoulCurrentDate(): Date {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    let isActive = true;
    let midnightTimeoutId: number | null = null;

    const clearMidnightTimeout = () => {
      if (midnightTimeoutId !== null) {
        window.clearTimeout(midnightTimeoutId);
        midnightTimeoutId = null;
      }
    };

    const refreshCurrentDate = () => {
      if (!isActive) {
        return;
      }

      const now = new Date();
      setCurrentDate(now);
      clearMidnightTimeout();
      midnightTimeoutId = window.setTimeout(
        refreshCurrentDate,
        getMillisecondsUntilNextSeoulDay(now),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCurrentDate();
      }
    };

    refreshCurrentDate();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshCurrentDate);

    return () => {
      isActive = false;
      clearMidnightTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshCurrentDate);
    };
  }, []);

  return currentDate;
}

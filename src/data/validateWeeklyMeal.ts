import type { DayOfWeek, WeeklyMeal } from "./meals";

export interface WeeklyMealValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface WeeklyMealValidationResult {
  errors: WeeklyMealValidationIssue[];
  warnings: WeeklyMealValidationIssue[];
}

const WEEKDAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const ISO_DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|([+-])(\d{2}):(\d{2}))$/;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function parseDateKey(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return parsed;
}

function isValidIsoDateTime(value: string): boolean {
  const match = ISO_DATE_TIME_PATTERN.exec(value);

  if (!match || !parseDateKey(match[1])) {
    return false;
  }

  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4] ?? 0);
  const zone = match[5];
  const offsetHour = Number(match[7] ?? 0);
  const offsetMinute = Number(match[8] ?? 0);

  if (hour > 23 || minute > 59 || second > 59) {
    return false;
  }

  if (
    zone !== "Z" &&
    (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute > 0))
  ) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function addUtcDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS)
    .toISOString()
    .slice(0, 10);
}

function isNormalizedText(value: string): boolean {
  return value.length > 0 && value === value.trim();
}

export function validateWeeklyMeal(
  weekly: WeeklyMeal,
): WeeklyMealValidationResult {
  const errors: WeeklyMealValidationIssue[] = [];
  const warnings: WeeklyMealValidationIssue[] = [];
  const addError = (code: string, path: string, message: string) => {
    errors.push({ code, path, message });
  };
  const addWarning = (code: string, path: string, message: string) => {
    warnings.push({ code, path, message });
  };
  const validateTextList = (values: readonly string[], path: string) => {
    values.forEach((value, index) => {
      if (!isNormalizedText(value)) {
        addError(
          "INVALID_TEXT",
          `${path}[${index}]`,
          "문구는 비어 있지 않고 앞뒤 공백이 없어야 합니다.",
        );
      }
    });
  };

  const weekStartDate = parseDateKey(weekly.weekStart);

  if (!weekStartDate) {
    addError(
      "INVALID_WEEK_START",
      "weekStart",
      "weekStart는 실제 존재하는 YYYY-MM-DD 날짜여야 합니다.",
    );
  } else if (weekStartDate.getUTCDay() !== 1) {
    addError(
      "WEEK_START_NOT_MONDAY",
      "weekStart",
      "weekStart는 월요일이어야 합니다.",
    );
  }

  if (!isValidIsoDateTime(weekly.updatedAt)) {
    addError(
      "INVALID_UPDATED_AT",
      "updatedAt",
      "updatedAt은 timezone을 포함한 유효한 ISO 8601 시각이어야 합니다.",
    );
  } else if (!weekly.updatedAt.endsWith("+09:00")) {
    addWarning(
      "NON_SEOUL_OFFSET",
      "updatedAt",
      "대한민국 시각은 +09:00 offset으로 기록하는 것을 권장합니다.",
    );
  }

  if (weekly.meals.length !== WEEKDAYS.length) {
    addError(
      "INVALID_MEAL_COUNT",
      "meals",
      "월요일부터 금요일까지 5개의 식단 레코드가 필요합니다.",
    );
  }

  validateTextList(weekly.sourceNotes, "sourceNotes");

  if (
    weekly.status === "DATE_UNVERIFIED" &&
    !weekly.sourceNotes.some(isNormalizedText)
  ) {
    addError(
      "UNVERIFIED_DATE_REQUIRES_SOURCE_NOTES",
      "sourceNotes",
      "날짜 미확인 식단에는 근거와 한계를 sourceNotes에 기록해야 합니다.",
    );
  }

  const seenDates = new Set<string>();

  weekly.meals.forEach((meal, mealIndex) => {
    const mealPath = `meals[${mealIndex}]`;
    const mealDate = parseDateKey(meal.date);

    if (!mealDate) {
      addError(
        "INVALID_MEAL_DATE",
        `${mealPath}.date`,
        "식단 날짜는 실제 존재하는 YYYY-MM-DD 날짜여야 합니다.",
      );
    }

    if (seenDates.has(meal.date)) {
      addError(
        "DUPLICATE_MEAL_DATE",
        `${mealPath}.date`,
        "같은 날짜의 식단을 중복 등록할 수 없습니다.",
      );
    }
    seenDates.add(meal.date);

    if (weekStartDate && mealIndex < WEEKDAYS.length) {
      const expectedDate = addUtcDays(weekStartDate, mealIndex);

      if (meal.date !== expectedDate) {
        addError(
          "MEAL_DATE_SEQUENCE_MISMATCH",
          `${mealPath}.date`,
          `식단 날짜는 ${expectedDate}이어야 합니다.`,
        );
      }
    }

    if (mealIndex < WEEKDAYS.length && meal.dayOfWeek !== WEEKDAYS[mealIndex]) {
      addError(
        "DAY_OF_WEEK_MISMATCH",
        `${mealPath}.dayOfWeek`,
        `요일은 ${WEEKDAYS[mealIndex]}이어야 합니다.`,
      );
    }

    if (meal.mealOptions.length !== 2) {
      addWarning(
        "UNEXPECTED_OPTION_COUNT",
        `${mealPath}.mealOptions`,
        "메뉴가 정확히 2개가 아니면 A/B 룰렛이 표시되지 않습니다.",
      );
    }

    validateTextList(meal.uncertainTexts, `${mealPath}.uncertainTexts`);

    const seenOptionLabels = new Set<string>();

    meal.mealOptions.forEach((option, optionIndex) => {
      const optionPath = `${mealPath}.mealOptions[${optionIndex}]`;

      if (!isNormalizedText(option.label)) {
        addError(
          "INVALID_OPTION_LABEL",
          `${optionPath}.label`,
          "메뉴 label은 비어 있지 않고 앞뒤 공백이 없어야 합니다.",
        );
      }

      if (seenOptionLabels.has(option.label)) {
        addError(
          "DUPLICATE_OPTION_LABEL",
          `${optionPath}.label`,
          "같은 날짜 안에서 메뉴 label을 중복할 수 없습니다.",
        );
      }
      seenOptionLabels.add(option.label);

      if (option.menuItems.length === 0) {
        addError(
          "EMPTY_MENU_ITEMS",
          `${optionPath}.menuItems`,
          "등록된 메뉴 option에는 한 개 이상의 메뉴가 필요합니다.",
        );
      }

      validateTextList(option.menuItems, `${optionPath}.menuItems`);

      const representativeMenuItem = option.representativeMenuItem;

      if (representativeMenuItem !== null) {
        if (
          typeof representativeMenuItem !== "string" ||
          !isNormalizedText(representativeMenuItem)
        ) {
          addError(
            "INVALID_REPRESENTATIVE_MENU_ITEM",
            `${optionPath}.representativeMenuItem`,
            "대표 음식은 비어 있지 않고 앞뒤 공백이 없는 메뉴명이어야 합니다.",
          );
        } else if (!option.menuItems.includes(representativeMenuItem)) {
          addError(
            "REPRESENTATIVE_MENU_ITEM_NOT_FOUND",
            `${optionPath}.representativeMenuItem`,
            "대표 음식은 같은 메뉴 option의 menuItems에 포함되어야 합니다.",
          );
        }
      }

      const seenMenuItems = new Set<string>();

      option.menuItems.forEach((menuItem, menuItemIndex) => {
        if (seenMenuItems.has(menuItem)) {
          addError(
            "DUPLICATE_MENU_ITEM",
            `${optionPath}.menuItems[${menuItemIndex}]`,
            "같은 메뉴 option 안에서 메뉴명을 중복할 수 없습니다.",
          );
        }
        seenMenuItems.add(menuItem);
      });
    });
  });

  return { errors, warnings };
}

export interface MealRouletteOdds {
  optionA: number;
  optionB: number;
}

const MIN_OPTION_A_ODDS = 35;
const MAX_OPTION_A_ODDS = 65;
const ODDS_PER_SIDE = 11;
const ODDS_VARIANT_COUNT = ODDS_PER_SIDE * 2;

function validateRandomValue(randomValue: number): void {
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new RangeError("난수 값은 0 이상 1 미만이어야 합니다.");
  }
}

function validateOdds(odds: MealRouletteOdds): void {
  if (
    !Number.isInteger(odds.optionA) ||
    !Number.isInteger(odds.optionB) ||
    odds.optionA < MIN_OPTION_A_ODDS ||
    odds.optionA > MAX_OPTION_A_ODDS ||
    odds.optionA + odds.optionB !== 100
  ) {
    throw new RangeError("룰렛 확률의 합은 100이어야 합니다.");
  }
}

export function createMealRouletteOdds(
  randomValue: number,
): MealRouletteOdds {
  validateRandomValue(randomValue);

  const oddsIndex = Math.floor(randomValue * ODDS_VARIANT_COUNT);
  const optionA =
    oddsIndex < ODDS_PER_SIDE
      ? MIN_OPTION_A_ODDS + oddsIndex
      : 55 + oddsIndex - ODDS_PER_SIDE;

  return { optionA, optionB: 100 - optionA };
}

export function pickMealRouletteOption(
  odds: MealRouletteOdds,
  randomValue: number,
): 0 | 1 {
  validateOdds(odds);
  validateRandomValue(randomValue);

  return randomValue < odds.optionA / 100 ? 0 : 1;
}

export function getMealRouletteLandingRotation(
  selectedOptionIndex: 0 | 1,
  odds: MealRouletteOdds,
  randomValue: number,
  currentRotation: number,
): number {
  validateOdds(odds);
  validateRandomValue(randomValue);

  if (selectedOptionIndex !== 0 && selectedOptionIndex !== 1) {
    throw new RangeError("룰렛 결과는 메뉴 A 또는 B여야 합니다.");
  }

  if (!Number.isFinite(currentRotation) || currentRotation < 0) {
    throw new RangeError("현재 회전값은 0 이상의 유한한 수여야 합니다.");
  }

  const optionAAngle = odds.optionA * 3.6;
  const segmentStart = selectedOptionIndex === 0 ? 0 : optionAAngle;
  const segmentSize =
    selectedOptionIndex === 0 ? optionAAngle : 360 - optionAAngle;
  const safeInset = segmentSize * 0.18;
  const landingAngle =
    segmentStart + safeInset + randomValue * (segmentSize - safeInset * 2);

  const desiredRotation = (360 - landingAngle) % 360;
  const normalizedCurrentRotation = currentRotation % 360;
  const additionalRotation =
    (desiredRotation - normalizedCurrentRotation + 360) % 360;

  return currentRotation + 5 * 360 + additionalRotation;
}

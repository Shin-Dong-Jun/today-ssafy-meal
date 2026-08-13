export function pickMealOptionIndex(
  optionCount: number,
  randomValue: number,
  previousIndex: number | null = null,
): number | null {
  if (!Number.isInteger(optionCount) || optionCount < 0) {
    throw new RangeError("메뉴 개수는 0 이상의 정수여야 합니다.");
  }

  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) {
    throw new RangeError("난수 값은 0 이상 1 미만이어야 합니다.");
  }

  if (optionCount === 0) {
    return null;
  }

  if (optionCount === 1) {
    return 0;
  }

  const hasValidPreviousIndex =
    previousIndex !== null &&
    Number.isInteger(previousIndex) &&
    previousIndex >= 0 &&
    previousIndex < optionCount;
  const candidateCount = hasValidPreviousIndex ? optionCount - 1 : optionCount;
  let selectedIndex = Math.floor(randomValue * candidateCount);

  if (hasValidPreviousIndex && selectedIndex >= previousIndex) {
    selectedIndex += 1;
  }

  return selectedIndex;
}

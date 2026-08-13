export const PROTEIN_KEYWORDS = [
  "닭",
  "치킨",
  "돼지",
  "돈육",
  "제육",
  "돈가스",
  "돈까스",
  "소고기",
  "쇠고기",
  "우육",
  "불고기",
  "오리",
  "생선",
  "참치",
  "고등어",
  "연어",
  "새우",
  "오징어",
  "낙지",
  "조개",
  "계란",
  "달걀",
  "두부",
  "콩",
  "치즈",
  "우유",
  "요구르트",
  "요거트",
] as const;

export type ProteinAssessmentStatus =
  | "FOUND"
  | "POSSIBLE"
  | "NOT_FOUND";

export const PROTEIN_STATUS_LABELS: Record<
  ProteinAssessmentStatus,
  string
> = {
  FOUND: "단백질 식품 있음",
  POSSIBLE: "일부 포함된 것으로 보임",
  NOT_FOUND: "메뉴명에서 찾기 어려움",
};

export interface ProteinAssessment {
  status: ProteinAssessmentStatus;
  label: string;
  matchedMenuItems: string[];
  possibleMenuItems: string[];
}

const includesProteinKeyword = (text: string) => {
  const normalizedText = text.normalize("NFC");
  return PROTEIN_KEYWORDS.some((keyword) => normalizedText.includes(keyword));
};

const findMatches = (items: readonly string[]) =>
  Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && includesProteinKeyword(item)),
    ),
  );

/**
 * 메뉴명만 확인하는 보수적인 판정입니다.
 * 확정 메뉴에서 키워드를 찾으면 FOUND, 읽기 불확실한 텍스트에서만 찾으면
 * POSSIBLE, 어느 쪽에서도 찾지 못하면 NOT_FOUND를 반환합니다.
 */
export function assessProtein(
  menuItems: readonly string[],
  uncertainTexts: readonly string[] = [],
): ProteinAssessment {
  const matchedMenuItems = findMatches(menuItems);
  const possibleMenuItems = findMatches(uncertainTexts);

  const status: ProteinAssessmentStatus =
    matchedMenuItems.length > 0
      ? "FOUND"
      : possibleMenuItems.length > 0
        ? "POSSIBLE"
        : "NOT_FOUND";

  return {
    status,
    label: PROTEIN_STATUS_LABELS[status],
    matchedMenuItems,
    possibleMenuItems,
  };
}

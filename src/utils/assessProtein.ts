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

export type ProteinAssessmentStatus = "FOUND" | "NOT_FOUND";

export const PROTEIN_STATUS_LABELS: Record<
  ProteinAssessmentStatus,
  string
> = {
  FOUND: "관련 키워드 확인",
  NOT_FOUND: "관련 키워드 미확인",
};

export interface ProteinAssessment {
  status: ProteinAssessmentStatus;
  label: string;
  matchedMenuItems: string[];
}

const includesProteinKeyword = (text: string) => {
  const normalizedText = text.normalize("NFC");
  const textWithoutSoybeanSprouts = normalizedText.replaceAll("콩나물", "");

  return PROTEIN_KEYWORDS.some((keyword) =>
    keyword === "콩"
      ? textWithoutSoybeanSprouts.includes(keyword)
      : normalizedText.includes(keyword),
  );
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
 * 메뉴명에서 미리 정의한 관련 키워드의 존재만 확인합니다.
 * 영양 성분이나 실제 재료, 제공량은 추론하지 않습니다.
 * 확정 메뉴에서 키워드를 찾으면 FOUND, 찾지 못하면 NOT_FOUND를 반환합니다.
 */
export function assessProtein(menuItems: readonly string[]): ProteinAssessment {
  const matchedMenuItems = findMatches(menuItems);

  const status: ProteinAssessmentStatus =
    matchedMenuItems.length > 0 ? "FOUND" : "NOT_FOUND";

  return {
    status,
    label: PROTEIN_STATUS_LABELS[status],
    matchedMenuItems,
  };
}

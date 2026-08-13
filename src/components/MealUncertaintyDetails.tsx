interface MealUncertaintyDetailsProps {
  texts: readonly string[];
}

export function MealUncertaintyDetails({
  texts,
}: MealUncertaintyDetailsProps) {
  if (texts.length === 0) {
    return null;
  }

  return (
    <details className="meal-uncertainty-details">
      <summary>사진에서 확인이 필요한 항목 {texts.length}개</summary>
      <ul aria-label="사진 판독 확인 필요 항목">
        {texts.map((text, index) => (
          <li key={`${index}-${text}`}>{text}</li>
        ))}
      </ul>
    </details>
  );
}

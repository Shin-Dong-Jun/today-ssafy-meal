import { describe, expect, it } from "vitest";
import { assessProtein } from "./assessProtein";

describe("assessProtein", () => {
  it.each(["숯불 닭고기구이", "매콤 제육볶음"])(
    "%s에서 단백질 식품 키워드를 찾는다",
    (menu) => {
      const result = assessProtein([menu]);

      expect(result.status).toBe("FOUND");
      expect(result.matchedMenuItems).toEqual([menu]);
    },
  );

  it("계란과 두부 메뉴를 단백질 식품으로 찾는다", () => {
    const result = assessProtein(["채소 계란말이", "두부조림"]);

    expect(result.status).toBe("FOUND");
    expect(result.matchedMenuItems).toEqual(["채소 계란말이", "두부조림"]);
  });

  it("단백질 키워드가 없으면 찾기 어려움으로 판정한다", () => {
    const result = assessProtein(["쌀밥", "배추김치", "오이무침"]);

    expect(result.status).toBe("NOT_FOUND");
    expect(result.matchedMenuItems).toEqual([]);
  });

  it("여러 메뉴 중 단백질 식품이 포함된 메뉴만 반환한다", () => {
    const result = assessProtein([
      "현미밥",
      "소고기 불고기",
      "참치 샐러드",
      "깍두기",
    ]);

    expect(result.matchedMenuItems).toEqual([
      "소고기 불고기",
      "참치 샐러드",
    ]);
  });

  it("빈 메뉴 목록을 안전하게 처리한다", () => {
    const result = assessProtein([]);

    expect(result).toMatchObject({
      status: "NOT_FOUND",
      matchedMenuItems: [],
      possibleMenuItems: [],
    });
  });

  it("불확실한 텍스트에서만 키워드를 찾으면 가능성으로 표시한다", () => {
    const result = assessProtein(["쌀밥"], ["닭 또는 오리로 보이는 구이"]);

    expect(result.status).toBe("POSSIBLE");
    expect(result.possibleMenuItems).toEqual(["닭 또는 오리로 보이는 구이"]);
  });
});

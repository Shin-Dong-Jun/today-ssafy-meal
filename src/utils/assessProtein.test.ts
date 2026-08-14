import { describe, expect, it } from "vitest";
import { assessProtein, PROTEIN_STATUS_LABELS } from "./assessProtein";

describe("assessProtein", () => {
  it.each(["숯불 닭고기구이", "매콤 제육볶음"])(
    "%s에서 관련 키워드를 찾는다",
    (menu) => {
      const result = assessProtein([menu]);

      expect(result.status).toBe("FOUND");
      expect(result.matchedMenuItems).toEqual([menu]);
    },
  );

  it("계란과 두부가 포함된 메뉴명을 관련 키워드로 찾는다", () => {
    const result = assessProtein(["채소 계란말이", "두부조림"]);

    expect(result.status).toBe("FOUND");
    expect(result.matchedMenuItems).toEqual(["채소 계란말이", "두부조림"]);
  });

  it("관련 키워드가 없으면 미확인으로 표시한다", () => {
    const result = assessProtein(["쌀밥", "배추김치", "오이무침"]);

    expect(result.status).toBe("NOT_FOUND");
    expect(result.label).toBe("관련 키워드 미확인");
    expect(result.matchedMenuItems).toEqual([]);
  });

  it("여러 메뉴 중 관련 키워드가 포함된 메뉴만 반환한다", () => {
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
    });
  });

  it("확정 메뉴에서 키워드를 찾았다는 사실만 표시한다", () => {
    const result = assessProtein(["계란말이"]);

    expect(result.label).toBe("관련 키워드 확인");
    expect(PROTEIN_STATUS_LABELS).toEqual({
      FOUND: "관련 키워드 확인",
      NOT_FOUND: "관련 키워드 미확인",
    });
  });

  it.each(["콩나물", "콩나물무침", "얼큰콩나물국"])(
    "%s는 '콩' 키워드로 오탐하지 않는다",
    (menu) => {
      const result = assessProtein([menu]);

      expect(result.status).toBe("NOT_FOUND");
      expect(result.matchedMenuItems).toEqual([]);
    },
  );

  it("콩나물이 있어도 다른 관련 키워드가 있으면 해당 메뉴를 찾는다", () => {
    const menu = "돈육콩나물볶음";
    const result = assessProtein([menu]);

    expect(result.status).toBe("FOUND");
    expect(result.matchedMenuItems).toEqual([menu]);
  });

  it("콩나물 문구를 제외한 별도의 콩 키워드는 계속 찾는다", () => {
    const result = assessProtein(["검은콩밥", "콩나물무침"]);

    expect(result.matchedMenuItems).toEqual(["검은콩밥"]);
  });
});

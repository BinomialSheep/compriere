import { describe, it, expect } from "vitest";
import { parseLottery } from "./lottery";

const validLottery = {
  id: "sample",
  name: "サンプルくじ",
  tiers: [
    { label: "A賞", rate: 0.1, kinds: 2 },
    { label: "B賞", rate: 0.5, kinds: 5 },
  ],
};

describe("parseLottery: 正常系", () => {
  it("妥当なくじを受理する", () => {
    const r = parseLottery(validLottery);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.tiers).toHaveLength(2);
      expect(r.value.tiers[0].rate).toBe(0.1);
    }
  });

  it("description は任意（あれば保持、なければ undefined）", () => {
    const withDesc = parseLottery({ ...validLottery, description: "出典" });
    expect(withDesc.ok && withDesc.value.description).toBe("出典");
    const without = parseLottery(validLottery);
    expect(without.ok && without.value.description).toBeUndefined();
  });

  it("確率の合計がちょうど1でも受理する", () => {
    const r = parseLottery({
      id: "x",
      name: "x",
      tiers: [
        { label: "A", rate: 0.5, kinds: 1 },
        { label: "B", rate: 0.5, kinds: 1 },
      ],
    });
    expect(r.ok).toBe(true);
  });

  it("余計なフィールドは落として正規化する", () => {
    const r = parseLottery({ ...validLottery, hoge: 1, tiers: [{ label: "A", rate: 0.1, kinds: 1, extra: 9 }] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(Object.keys(r.value.tiers[0])).toEqual(["label", "rate", "kinds"]);
  });
});

describe("parseLottery: 異常系", () => {
  it("オブジェクト以外を拒否する", () => {
    for (const bad of [null, undefined, 1, "x", []]) {
      expect(parseLottery(bad).ok).toBe(false);
    }
  });

  it("id/name が空なら拒否する", () => {
    const r = parseLottery({ id: "", name: "", tiers: validLottery.tiers });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.some((e) => e.startsWith("id"))).toBe(true);
      expect(r.errors.some((e) => e.startsWith("name"))).toBe(true);
    }
  });

  it("tiers が空配列なら拒否する", () => {
    expect(parseLottery({ id: "x", name: "x", tiers: [] }).ok).toBe(false);
  });

  it("rate が範囲外なら拒否する", () => {
    const r = parseLottery({ id: "x", name: "x", tiers: [{ label: "A", rate: 1.5, kinds: 1 }] });
    expect(r.ok).toBe(false);
  });

  it("kinds が0や非整数なら拒否する", () => {
    expect(parseLottery({ id: "x", name: "x", tiers: [{ label: "A", rate: 0.1, kinds: 0 }] }).ok).toBe(false);
    expect(parseLottery({ id: "x", name: "x", tiers: [{ label: "A", rate: 0.1, kinds: 1.5 }] }).ok).toBe(false);
  });

  it("確率の合計が1を大きく超えたら拒否する", () => {
    const r = parseLottery({
      id: "x",
      name: "x",
      tiers: [
        { label: "A", rate: 0.6, kinds: 1 },
        { label: "B", rate: 0.6, kinds: 1 },
      ],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.includes("合計"))).toBe(true);
  });

  it("丸め誤差で合計が僅かに1を超える程度なら受理する（実測値・手入力対策）", () => {
    const r = parseLottery({
      id: "x",
      name: "x",
      tiers: [
        { label: "A", rate: 0.5005, kinds: 1 },
        { label: "B", rate: 0.5005, kinds: 1 },
      ],
    });
    expect(r.ok).toBe(true); // 合計 1.001 は許容内
  });

  it("複数の不正を全件まとめて返す", () => {
    const r = parseLottery({ id: "", name: "", tiers: [{ label: "", rate: 9, kinds: 0 }] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBeGreaterThanOrEqual(4);
  });
});

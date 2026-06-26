import { describe, it, expect } from "vitest";
import { presets, defaultPreset } from "./index";
import { evaluateLottery } from "../core/evaluate";
import { getCompProb, getOneProb } from "../core/legacy-dp";

describe("同梱プリセット", () => {
  it("すべて読み込めて妥当（index.ts のロード時検証を通過している）", () => {
    expect(presets.length).toBeGreaterThanOrEqual(2);
    for (const p of presets) {
      expect(p.id).toBeTruthy();
      expect(p.tiers.length).toBeGreaterThan(0);
    }
  });

  it("初期表示は実測", () => {
    expect(defaultPreset.id).toBe("measured");
  });

  it("各プリセットの確率合計はほぼ1（ウェブポンは毎回必ず何か出る／実測は丸め誤差あり）", () => {
    for (const p of presets) {
      const sum = p.tiers.reduce((a, t) => a + t.rate, 0);
      expect(sum).toBeCloseTo(1, 2);
    }
  });
});

describe("データ→エンジンのパイプラインが旧サイトの数値を再現する", () => {
  const drawCounts = [10, 60, 100, 300, 500];

  for (const preset of presets) {
    for (const n of drawCounts) {
      it(`${preset.id} を ${n} 回引いた結果が旧DPと一致`, () => {
        const result = evaluateLottery(preset, n);
        for (const { tier, completion, atLeastOne } of result.tiers) {
          const expectedComp = getCompProb(n, tier.kinds, tier.rate);
          const expectedOne = getOneProb(n, tier.rate);
          expect(Math.abs(completion - expectedComp)).toBeLessThanOrEqual(1e-8);
          expect(Math.abs(atLeastOne - expectedOne)).toBeLessThanOrEqual(1e-8);
        }
      });
    }
  }
});

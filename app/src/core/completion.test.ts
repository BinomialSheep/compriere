import { describe, it, expect } from "vitest";
import { completionProbability, atLeastOneProbability } from "./completion";
import { getCompProb, getOneProb } from "./legacy-dp";

/** 絶対誤差での近似一致を確認するヘルパー */
function expectClose(actual: number, expected: number, tol = 1e-8): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);
}

describe("completionProbability は旧DPと一致する", () => {
  // 旧DPが破綻しない範囲の n で総当たり検証する。
  const ns = [0, 1, 2, 5, 10, 30, 60, 100, 150];
  const ks = [1, 2, 3, 5, 8, 10];
  const ps = [0.001, 0.01, 0.08, 0.1, 0.3, 0.45, 0.55, 0.9, 1.0];

  for (const n of ns) {
    for (const k of ks) {
      for (const p of ps) {
        it(`n=${n}, k=${k}, p=${p}`, () => {
          expectClose(completionProbability(n, k, p), getCompProb(n, k, p));
        });
      }
    }
  }
});

describe("atLeastOneProbability は旧 getOneProb と一致する", () => {
  const ns = [0, 1, 10, 100, 300, 1000];
  const ps = [0, 0.001, 0.01, 0.1, 0.5, 0.9, 1.0];

  for (const n of ns) {
    for (const p of ps) {
      it(`n=${n}, p=${p}`, () => {
        expectClose(atLeastOneProbability(n, p), getOneProb(n, p));
      });
    }
  }
});

describe("境界・性質", () => {
  it("n=0 ではコンプ率0（k>=1）", () => {
    for (const k of [1, 2, 5, 10]) {
      expectClose(completionProbability(0, k, 0.5), 0);
    }
  });

  it("k=1 のコンプ率は 1-(1-p)^n（1個以上出る率）に一致", () => {
    for (const n of [1, 10, 100, 1000]) {
      for (const p of [0.01, 0.1, 0.5]) {
        expectClose(completionProbability(n, 1, p), atLeastOneProbability(n, p));
      }
    }
  });

  it("結果は常に [0,1] に収まる", () => {
    for (const n of [0, 1, 50, 1000, 10000]) {
      for (const k of [1, 5, 30]) {
        for (const p of [0, 0.01, 0.5, 1.0]) {
          const v = completionProbability(n, k, p);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("n を増やすとコンプ率は単調非減少", () => {
    let prev = -1;
    for (let n = 0; n <= 500; n += 10) {
      const v = completionProbability(n, 8, 0.3);
      expect(v).toBeGreaterThanOrEqual(prev - 1e-12);
      prev = v;
    }
  });

  it("旧DPが破綻する大きな n でも有限値を返す（新エンジンの主目的）", () => {
    const v = completionProbability(10000, 10, 0.55);
    expect(Number.isFinite(v)).toBe(true);
    expect(v).toBeGreaterThan(0.999); // 十分多く引けばほぼ確実にコンプ
  });
});

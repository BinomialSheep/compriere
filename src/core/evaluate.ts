/**
 * くじ（Lottery）と引く回数から、賞ごとの確率を計算する。
 * core/completion.ts のエンジンを Lottery 構造に橋渡しするだけの薄い層。
 */
import { completionProbability, atLeastOneProbability } from "./completion";
import type { Lottery, Tier } from "./lottery";

export type TierResult = {
  tier: Tier;
  /** n回引いてこの賞の全種類が揃う確率 */
  completion: number;
  /** n回引いてこの賞が1個以上出る確率 */
  atLeastOne: number;
};

export type LotteryResult = {
  lottery: Lottery;
  draws: number;
  tiers: TierResult[];
};

/** くじを draws 回引いた時の、賞ごとの確率をまとめて返す */
export function evaluateLottery(lottery: Lottery, draws: number): LotteryResult {
  const tiers = lottery.tiers.map<TierResult>((tier) => ({
    tier,
    completion: completionProbability(draws, tier.kinds, tier.rate),
    atLeastOne: atLeastOneProbability(draws, tier.rate),
  }));
  return { lottery, draws, tiers };
}

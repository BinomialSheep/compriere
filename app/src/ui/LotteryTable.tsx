import { completionProbability, atLeastOneProbability } from "../core/completion";
import type { Tier } from "../core/lottery";
import { formatPercent } from "../core/format";

type Props = {
  tiers: Tier[];
  /** 引く回数。入力が不正なときは null（結果は «—» 表示） */
  draws: number | null;
  onUpdateTier: (index: number, patch: Partial<Tier>) => void;
  onRemoveTier: (index: number) => void;
  onAddTier: () => void;
};

/** 表示用に rate(0..1) をパーセント値へ。浮動小数のノイズを丸める */
function toPercentValue(rate: number): number {
  return Math.round(rate * 1e6) / 1e4;
}

/** 賞ごとの結果。入力が不正な賞は null を返して «—» 表示にする */
function tierResult(
  tier: Tier,
  draws: number | null,
): { completion: number; atLeastOne: number } | null {
  if (draws === null) return null;
  const okKinds = Number.isInteger(tier.kinds) && tier.kinds >= 1;
  const okRate = tier.rate >= 0 && tier.rate <= 1;
  if (!okKinds || !okRate) return null;
  return {
    completion: completionProbability(draws, tier.kinds, tier.rate),
    atLeastOne: atLeastOneProbability(draws, tier.rate),
  };
}

export function LotteryTable({
  tiers,
  draws,
  onUpdateTier,
  onRemoveTier,
  onAddTier,
}: Props) {
  return (
    <div className="table-wrap">
      <table className="lottery-table">
        <thead>
          <tr>
            <th className="col-label">賞</th>
            <th className="col-num">提供割合</th>
            <th className="col-num">種類数</th>
            <th className="col-num">コンプ率</th>
            <th className="col-num">1個以上出る率</th>
            <th className="col-action" aria-label="操作"></th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, i) => {
            const result = tierResult(tier, draws);
            return (
              <tr key={i}>
                <td>
                  <input
                    className="input-label"
                    type="text"
                    value={tier.label}
                    aria-label={`賞${i + 1}の名前`}
                    onChange={(e) => onUpdateTier(i, { label: e.target.value })}
                  />
                </td>
                <td className="col-num">
                  <span className="input-suffix">
                    <input
                      className="input-num"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={toPercentValue(tier.rate)}
                      aria-label={`${tier.label}の提供割合(%)`}
                      onChange={(e) =>
                        onUpdateTier(i, {
                          rate: (Number(e.target.value) || 0) / 100,
                        })
                      }
                    />
                    <span className="suffix">%</span>
                  </span>
                </td>
                <td className="col-num">
                  <input
                    className="input-num"
                    type="number"
                    min={1}
                    step={1}
                    value={Number.isFinite(tier.kinds) ? tier.kinds : ""}
                    aria-label={`${tier.label}の種類数`}
                    onChange={(e) =>
                      onUpdateTier(i, { kinds: Math.floor(Number(e.target.value)) })
                    }
                  />
                </td>
                <td className="col-num result">
                  {result ? formatPercent(result.completion) : "—"}
                </td>
                <td className="col-num result">
                  {result ? formatPercent(result.atLeastOne) : "—"}
                </td>
                <td className="col-action">
                  <button
                    type="button"
                    className="btn-remove"
                    aria-label={`${tier.label}を削除`}
                    disabled={tiers.length <= 1}
                    onClick={() => onRemoveTier(i)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button type="button" className="btn-add" onClick={onAddTier}>
        ＋ 賞を追加
      </button>
    </div>
  );
}

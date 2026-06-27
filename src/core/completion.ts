/**
 * コンプ率計算エンジン（本番）。
 *
 * モデル: 1回引くごとに、確率 p で「当たり」が出る。当たりは k 種類から一様
 * （特定の1種類が出る確率は p/k）。これを n 回引く。賞ごとに独立。
 *
 * コンプ率（n回でk種類すべて collect）は2つの手法で計算でき、k の大小で使い分ける:
 *
 * 1. 包除原理（k が小さいとき）: O(k)、n がいくつでも一瞬。
 *      P = Σ_{j=0}^{k} (-1)^j C(k,j) (1 - j*p/k)^n
 *    ただし k が大きいと各項が C(k, k/2) まで巨大化し、符号交替の打ち消しで
 *    桁落ち（catastrophic cancellation）を起こして答えが壊れる。
 *
 * 2. 占有数DP（k が大きいとき）: O(n*k)、二項係数を使わず全状態が [0,1] に
 *    収まるので桁落ちしない。n にも k にも強い。
 */

/** これ以下の k は包除原理を使う。これを超えると桁落ちするので占有数DPに切り替える。 */
const INCLUSION_EXCLUSION_MAX_K = 20;

/** 入力が確率・自然数として妥当かを検証する */
function assertValidArgs(n: number, k: number, p: number): void {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`n は 0 以上の整数: ${n}`);
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError(`k は 1 以上の整数: ${k}`);
  }
  if (!(p >= 0 && p <= 1)) {
    throw new RangeError(`p は 0..1 の確率: ${p}`);
  }
}

/**
 * 包除原理による閉じた式。計算量 O(k)、n に依らず高速。
 * k が大きいと桁落ちするため、小さい k 専用。
 */
function completionByInclusionExclusion(n: number, k: number, p: number): number {
  // C(k,j) を j について漸化的に更新する（整数値なので誤差なく作れる）。
  let binom = 1; // C(k,0)
  let sum = 0;
  for (let j = 0; j <= k; j++) {
    const term = binom * (1 - (j * p) / k) ** n;
    sum += j % 2 === 0 ? term : -term;
    // C(k, j+1) = C(k, j) * (k - j) / (j + 1)
    binom = (binom * (k - j)) / (j + 1);
  }
  return sum;
}

/**
 * 占有数DP。dp[j] = ちょうど j 種類集まっている確率、を1回ずつ更新する。
 * 計算量 O(n*k)。二項係数を使わず全値が [0,1] なので桁落ちしない。
 */
function completionByOccupancyDP(n: number, k: number, p: number): number {
  const dp = new Float64Array(k + 1);
  dp[0] = 1;
  for (let i = 0; i < n; i++) {
    // dp[j] は更新後に dp[j-1]（旧値）を使うので j の大きい方から回す
    for (let j = k; j >= 1; j--) {
      const stay = 1 - p + (p * j) / k; // j のまま（被り or 非当たり）
      const gain = (p * (k - j + 1)) / k; // j-1 種から新種を引いて j へ
      dp[j] = dp[j] * stay + dp[j - 1] * gain;
    }
    dp[0] *= 1 - p; // j=0 は非当たりのときだけ留まる
  }
  return dp[k];
}

/**
 * 確率 p・k 種類のガチャを n 回引いて k 種類すべて揃う確率（コンプ率）。
 * k の大小で包除原理と占有数DPを使い分ける。
 */
export function completionProbability(n: number, k: number, p: number): number {
  assertValidArgs(n, k, p);

  const raw =
    k <= INCLUSION_EXCLUSION_MAX_K
      ? completionByInclusionExclusion(n, k, p)
      : completionByOccupancyDP(n, k, p);

  // 浮動小数の丸めで僅かに [0,1] を外れることがあるためクランプする。
  return Math.min(1, Math.max(0, raw));
}

/**
 * 確率 p で当たるガチャを n 回引いて、少なくとも1個出る確率（余事象）。
 * 種類数によらず賞全体で「1個以上出るか」を表す。
 */
export function atLeastOneProbability(n: number, p: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`n は 0 以上の整数: ${n}`);
  }
  if (!(p >= 0 && p <= 1)) {
    throw new RangeError(`p は 0..1 の確率: ${p}`);
  }
  return 1 - (1 - p) ** n;
}

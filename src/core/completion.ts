/**
 * コンプ率計算エンジン（本番）。
 *
 * モデル: 1回引くごとに、確率 p で「当たり」が出る。当たりは k 種類から一様
 * （特定の1種類が出る確率は p/k）。これを n 回引く。賞ごとに独立。
 *
 * 旧 DP（legacy-dp.ts）は同じ量を O(n*k) と BigInt で計算していて、
 * n が大きいと Number(cmb(...)) が Infinity になり破綻した。
 * ここでは包除原理の閉じた式に置き換え、O(k) で任意の n に対して安定させる。
 *
 *   コンプ率 P(n回でk種類すべて collect)
 *     = Σ_{j=0}^{k} (-1)^j C(k,j) (1 - j*p/k)^n
 *
 *   k=1 のとき 1 - (1-p)^n となり「1個以上出る率」と一致する。
 */

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
 * 確率 p・k 種類のガチャを n 回引いて k 種類すべて揃う確率（コンプ率）。
 * 包除原理による閉じた式。計算量 O(k)。
 */
export function completionProbability(n: number, k: number, p: number): number {
  assertValidArgs(n, k, p);

  // C(k,j) を j について漸化的に更新する（整数値なので誤差なく作れる）。
  let binom = 1; // C(k,0)
  let sum = 0;
  for (let j = 0; j <= k; j++) {
    const term = binom * (1 - (j * p) / k) ** n;
    sum += j % 2 === 0 ? term : -term;
    // C(k, j+1) = C(k, j) * (k - j) / (j + 1)
    binom = (binom * (k - j)) / (j + 1);
  }

  // 浮動小数の丸めで僅かに [0,1] を外れることがあるためクランプする。
  return Math.min(1, Math.max(0, sum));
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

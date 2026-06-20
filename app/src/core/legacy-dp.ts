/**
 * 旧 js/script.js の確率DPを忠実にTypeScriptへ移植したもの。
 *
 * 役割は「検証用の参照実装」。新エンジン completion.ts が
 * このDPと同じ値を返すことをテストで確認するためだけに存在し、
 * 本番のUIからは使わない。
 *
 * 注意: 元実装どおり n が大きい（おおむね 1000 以上）と
 * Number(cmb(...)) が Infinity になり破綻する。これは既知の制約で、
 * 新エンジンが解消する当の問題。検証は破綻しない範囲の n で行う。
 */

/** 組み合わせ数 nCr（元実装と同じく BigInt で厳密計算） */
export function cmb(n: number, r: number): bigint {
  r = Math.min(n - r, r);
  if (r === 0) return 1n;
  const fact = (now: bigint, end: bigint, ret: bigint): bigint =>
    now === end ? now * ret : fact(now - 1n, end, now * ret);
  const over = fact(BigInt(n), BigInt(n - r + 1), 1n);
  const under = fact(BigInt(r), 1n, 1n);
  return over / under;
}

/**
 * 同様に確からしい k 種類が景品のガチャを ni 回引いた時、
 * ki 種類が揃っている確率 kindArr[ni][ki]
 */
export function getKindProbArray(n: number, k: number): number[][] {
  const kindArr: number[][] = new Array(n + 1);
  for (let i = 0; i <= n; i++) kindArr[i] = new Array(k + 1).fill(0);
  // i回引いて1種類揃う（全部被る）確率は(1/k)^(i-1)
  for (let i = 1; i <= n; i++) kindArr[i][1] = (1 / k) ** (i - 1);

  for (let i = 1; i <= n; i++) {
    for (let j = 2; j <= k; j++) {
      // 直前(i-1回目)でj-1種類揃っていて、今回被らず引く
      const case1 = (kindArr[i - 1][j - 1] * (k - j + 1)) / k;
      // 直前(i-1回目)でj種類揃っていて、今回被る
      const case2 = (kindArr[i - 1][j] * j) / k;
      kindArr[i][j] = case1 + case2;
    }
  }
  return kindArr;
}

/** 確率pで当たるガチャをn回引いた時に、当たりがm回出る確率 winArr[m] */
export function getWinProbArray(n: number, p: number): number[] {
  const winArr: number[] = new Array(n + 1);
  for (let i = 0; i <= n; i++) {
    winArr[i] = Number(cmb(n, i)) * p ** i * (1 - p) ** (n - i);
  }
  return winArr;
}

/** 確率pで当たりが出る、k種類の当たりがあるガチャをn回引いた時のコンプ率 */
export function getCompProb(n: number, k: number, p: number): number {
  const winArr = getWinProbArray(n, p);
  const kindArr = getKindProbArray(n, k);

  let ans = 0;
  for (let i = 0; i <= n; i++) ans += winArr[i] * kindArr[i][k];
  return ans;
}

/** 確率pで当たるガチャをn回引いて少なくとも1回引ける確率（余事象） */
export function getOneProb(n: number, p: number): number {
  return 1 - (1 - p) ** n;
}

/** 確率(0..1)をパーセント表記の文字列にする。例: 0.1234 -> "12.34%" */
export function formatPercent(p: number, digits = 2): string {
  return (p * 100).toFixed(digits) + "%";
}

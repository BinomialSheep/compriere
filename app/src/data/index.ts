/**
 * 同梱プリセット（実測くじ）の読み込み口。
 * JSON を実行時にも parseLottery で検証し、不正なら早期に例外を投げる
 * （プリセットは作者が書くデータなので、壊れていたら開発時に気づきたい）。
 */
import { parseLottery, type Lottery } from "../core/lottery";
import level1 from "./presets/level1.json";
import level2 from "./presets/level2.json";
import level3 from "./presets/level3.json";
import level4 from "./presets/level4.json";
import level5 from "./presets/level5.json";

const rawPresets: unknown[] = [level1, level2, level3, level4, level5];

export const presets: Lottery[] = rawPresets.map((raw) => {
  const result = parseLottery(raw);
  if (!result.ok) {
    throw new Error(
      `プリセットが不正です:\n${result.errors.join("\n")}\n${JSON.stringify(raw)}`,
    );
  }
  return result.value;
});

/** 初期表示するプリセット（「普通」をデフォルトにする） */
export const defaultPreset: Lottery = presets[2];

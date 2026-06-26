/**
 * 同梱プリセット（実測くじ）の読み込み口。
 * JSON を実行時にも parseLottery で検証し、不正なら早期に例外を投げる
 * （プリセットは作者が書くデータなので、壊れていたら開発時に気づきたい）。
 */
import { parseLottery, type Lottery } from "../core/lottery";
import measured from "./presets/measured.json";
import nakuruKujimate from "./presets/nakuru-kujimate.json";
import asamiyui from "./presets/asamiyui.json";

const rawPresets: unknown[] = [measured, nakuruKujimate, asamiyui];

export const presets: Lottery[] = rawPresets.map((raw) => {
  const result = parseLottery(raw);
  if (!result.ok) {
    throw new Error(
      `プリセットが不正です:\n${result.errors.join("\n")}\n${JSON.stringify(raw)}`,
    );
  }
  return result.value;
});

/** 初期表示するプリセット（「実測」をデフォルトにする） */
export const defaultPreset: Lottery = presets[0];

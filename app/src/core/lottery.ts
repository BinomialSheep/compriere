/**
 * くじのデータモデルと、その実行時バリデーション。
 *
 * 「完全ユーザー設定型」なので、くじの定義は
 *   - 同梱プリセット（JSON）
 *   - ユーザーが編集した値
 *   - URL共有やlocalStorageから復元した値
 * といった「信頼できない入力」として入ってくる。型(TS)はビルド時しか守れない
 * ため、ここで実行時にも検証する。
 */

/** 1回引いてこの賞が出る確率 rate(0..1) と、その賞の景品種類数 kinds を持つ「賞」 */
export type Tier = {
  label: string;
  rate: number; // 1回引いてこの賞が出る確率（0..1）
  kinds: number; // この賞の景品種類数（1以上の整数）
};

/** 可変長の賞からなる1つのくじ */
export type Lottery = {
  id: string;
  name: string;
  description?: string; // 出典・補足（任意）
  tiers: Tier[];
};

/** バリデーション結果。失敗時はエラー文言を全件返す（UIでまとめて表示できる） */
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

/**
 * 賞の確率の合計が「1 + この値」を超えたら不正とみなす。
 * 1回の抽選で出る賞は排他なので合計は本来1以下だが、実測値や手入力は
 * パーセントを丸めるためぴったり1にならない。旧サイトが手動モードで
 * 99〜101% を許容していたのと同じく、約1%の許容を持たせる。
 */
export const RATE_SUM_TOLERANCE = 0.01;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

/** 1つの賞を検証し、エラーを errors に push する */
function validateTier(input: unknown, index: number, errors: string[]): void {
  const where = `tiers[${index}]`;
  if (!isRecord(input)) {
    errors.push(`${where}: オブジェクトではありません`);
    return;
  }
  if (!isNonEmptyString(input.label)) {
    errors.push(`${where}.label: 空でない文字列が必要です`);
  }
  if (typeof input.rate !== "number" || Number.isNaN(input.rate)) {
    errors.push(`${where}.rate: 数値が必要です`);
  } else if (input.rate < 0 || input.rate > 1) {
    errors.push(`${where}.rate: 0〜1 の範囲が必要です（現在 ${input.rate}）`);
  }
  if (typeof input.kinds !== "number" || !Number.isInteger(input.kinds)) {
    errors.push(`${where}.kinds: 整数が必要です`);
  } else if (input.kinds < 1) {
    errors.push(`${where}.kinds: 1 以上が必要です（現在 ${input.kinds}）`);
  }
}

/**
 * 未知の入力を Lottery として検証する。
 * 成功なら { ok: true, value }、失敗なら { ok: false, errors: 全エラー }。
 */
export function parseLottery(input: unknown): ParseResult<Lottery> {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["くじはオブジェクトである必要があります"] };
  }
  if (!isNonEmptyString(input.id)) {
    errors.push("id: 空でない文字列が必要です");
  }
  if (!isNonEmptyString(input.name)) {
    errors.push("name: 空でない文字列が必要です");
  }
  if (input.description !== undefined && typeof input.description !== "string") {
    errors.push("description: 文字列が必要です（省略可）");
  }

  if (!Array.isArray(input.tiers)) {
    errors.push("tiers: 配列が必要です");
  } else if (input.tiers.length === 0) {
    errors.push("tiers: 1つ以上の賞が必要です");
  } else {
    input.tiers.forEach((tier, i) => validateTier(tier, i, errors));

    // 個々の賞が数値として妥当な時だけ合計チェック（二重エラーを避ける）
    const rates = input.tiers
      .map((t) => (isRecord(t) ? t.rate : NaN))
      .filter((r): r is number => typeof r === "number" && !Number.isNaN(r));
    if (rates.length === input.tiers.length) {
      const sum = rates.reduce((a, b) => a + b, 0);
      if (sum > 1 + RATE_SUM_TOLERANCE) {
        errors.push(`賞の確率の合計が1を大きく超えています（現在 ${sum}）`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  // ここまで来れば各フィールドは検証済み。安全にキャストして返す。
  const rec = input as {
    id: string;
    name: string;
    description?: string;
    tiers: Tier[];
  };
  const value: Lottery = {
    id: rec.id,
    name: rec.name,
    tiers: rec.tiers.map((t) => ({
      label: t.label,
      rate: t.rate,
      kinds: t.kinds,
    })),
  };
  if (rec.description !== undefined) value.description = rec.description;
  return { ok: true, value };
}

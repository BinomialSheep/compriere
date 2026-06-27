# compriere 全面刷新 設計メモ（作業中）

> このファイルは設計convergence用のスクラッチ。コミットしたくなったら .gitignore の `DESIGN.md` 行を削除する。

## プロジェクトの本質的価値（守る／伸ばす）

1. **確率計算エンジン**：1賞に複数のランダム景品があるくじの、回数ごとのコンプ率を実用時間で計算。他にない核。
2. **実測の提供割合データ**：非公開のウェブポン提供割合をスクレイピングで取得した資産。
3. **GitHub Pages 完結のサーバーレス構成**。

## 確定した方針（2026-06-21）

- **プロダクト方向**：完全ユーザー設定型（汎用コンプ率計算機）。ただし実測くじを目立つプリセットとして同梱し、既存の検索流入を維持する。
- **スタック**：React + Vite + TypeScript。ビルド成果物 `dist/` を GitHub Pages へ。
- **エンジン**：包除原理の閉じた式へ作り替える。既存DPを参照実装として数値一致を検証してから採用。

### 集客リスクの扱い
汎用化で「ウェブポンのコンプ率＝このサイト」という流入が薄まる懸念。
→ 実測プリセットをトップに front-and-center で残し、両取りする。

## エンジン（コア価値）

各回が「確率 p で当たり、当たりは k 種類から一様」というモデル。賞ごと独立。

- コンプ率（n回でk種類すべて collect）:
  `P = Σ_{j=0}^{k} (-1)^j C(k,j) (1 - j·p/k)^n`
  - 計算量 O(k)、任意の n で安定（既存DPの n>1000 破綻＝`Number(cmb(1000,500))=Infinity` を解消）。
  - k=1 で `1-(1-p)^n` に一致（＝既存「1個以上出る率」と整合）。
- 1個以上出る率（賞全体）: `1 - (1-p)^n`。

**検証方針**：`legacy-dp.ts` に既存の getCompProb を移植し、`completion.ts`（新）と広範な (n,k,p) で数値一致をテスト。一致を確認してから本番採用。

## データモデル（要確認の前提）

```ts
type Tier = { label: string; rate: number; kinds: number };
type Lottery = {
  id: string;
  name: string;
  source?: string;        // 出典URL
  tiers: Tier[];          // 可変長
};
```

- コンプ率は **賞ごと独立**（現行挙動と同じ）。
- 「全賞まとめて全アイテム集める」コンプは別物（計算が重い）→ 将来スコープ。

## サーバーレスでの state 戦略

- **URLハッシュ**に lottery を encode → 共有・ブックマーク（`#lottery=...`）。
- **localStorage** → 自分のくじを端末保存。
- **presets** → `data/presets/*.json` を同梱、初期表示。

## ディレクトリ構成（案）

```
src/
  core/
    completion.ts        包除原理エンジン
    completion.test.ts   legacy-dp と数値一致を検証
    legacy-dp.ts         既存DP移植（検証用の基準。本番不使用）
    lottery.ts           Lottery型 + バリデーション
  data/presets/*.json    実測くじ（なくる/ゆい…）
  state/
    urlCodec.ts          ⇄ URLハッシュ
    storage.ts           ⇄ localStorage
  ui/
    LotteryEditor.tsx
    ResultTable.tsx
    PresetPicker.tsx
  App.tsx / main.tsx
```

## ビルド順（各段で旧サイトと出力一致を確認）

1. ✅ core/completion + legacy-dp + テスト（最重要・最初）— 完了 2026-06-21
2. ✅ data + lottery型（実測値をJSONへ外出し）— 完了 2026-06-21
3. ⏭️ state（URL / localStorage）— 当面スキップ（利用見込みが低いとの判断）
4. ✅ UI（React）— 完了 2026-06-21

## 進捗ログ

### 2026-06-21: Step 1 完了 — エンジン確定
- `app/` に Vite + React 19 + TS 6 + Vitest を scaffold（npm 管理）。
- `src/core/legacy-dp.ts`: 旧DPを忠実移植（検証用の基準）。
- `src/core/completion.ts`: 包除原理エンジン（本番）。`completionProbability(n,k,p)` と `atLeastOneProbability(n,p)`。
- `src/core/completion.test.ts`: 新旧を 486 通りの (n,k,p) で数値一致検証 ＋ 境界/性質。
- **結果: 全533テスト通過。型チェックもクリーン。** 旧DPと完全一致を確認しつつ、n>1000 制約を解消（n=10000 でも有限・正確）。

### 2026-06-21: Step 2 完了 — データモデル
- `tsconfig.app.json` に `strict: true` と `resolveJsonModule: true` を追加（「型がない」課題への対処）。
- `src/core/lottery.ts`: `Tier` / `Lottery` 型 ＋ `parseLottery()`（実行時バリデーション、エラー全件返し）。確率合計>1 や kinds<1 等を検出。
- `src/core/evaluate.ts`: `evaluateLottery(lottery, draws)` で賞ごとの comp率/1個以上出る率を算出。
- `src/data/presets/*.json`: 実測くじ（nakuru-kujimate / asamiyui）を旧サイトの値で外出し。
- `src/data/index.ts`: プリセットをロード時に検証して公開（`presets` / `defaultPreset`）。
- テスト追加: lottery バリデーション、プリセット妥当性、**データ→エンジンが旧DPの数値を再現**することを確認。
- **結果: 全557テスト通過。`tsc -b` クリーン。**

### 2026-06-21: Step 4 完了 — UI（React）
- `src/App.tsx`: 状態管理＋画面構成。プリセット選択／くじ名／引く回数を持ち、**入力した瞬間に再計算**（旧「計算」ボタン廃止）。
- `src/ui/LotteryTable.tsx`: 賞ごとに label/提供割合(%)/種類数を編集、行の追加・削除、コンプ率・1個以上出る率を表示。不正入力の賞は «—»。
- `src/core/format.ts`: `formatPercent`。
- `src/index.css` / `src/App.css`: ライト/ダーク対応のクリーンなデザインに刷新（課題「しょぼい」対応）。テンプレのサンプル素材は削除。
- `index.html`: title「こんぷりえーる」、lang=ja、description 設定。
- **結果: 全557テスト通過 / `npm run build` 成功（gzip JS 約63KB）/ dev サーバー正常起動。**
- 未対応（次の候補）: UIのレンダリングテスト（jsdom + testing-library）、提供割合の合計が100%未満のときの「はずれ」表現、プリセット拡充（ユーザー側で用意予定）。

### 2026-06-21: デプロイ設定（GitHub Actions → Pages）
- `app/vite.config.ts`: 本番ビルド時のみ `base: '/compriere/'`（プロジェクトページ配下）。dev は `/`。
- `.github/workflows/deploy.yml`: main への push / 手動実行で `app/` を `npm ci → npm test → npm run build` し、`app/dist` を Pages へデプロイ。
- 検証: 本番ビルドの `dist/index.html` が `/compriere/assets/...` を参照することを確認。
- **要・手動操作（go-live ゲート）**: GitHub の Settings → Pages → Source を「Deploy from a branch」から **「GitHub Actions」** に切り替える。切り替えると配信元が旧ルート（index.html）から新アプリ（app/dist）に変わる。旧ファイルはリポジトリに残るが配信されなくなる。戻す時は Source をブランチに戻せばよい。
- 将来: go-live 後に旧 index.html / js / style.css を整理。さらに将来は app/ をルートへ昇格する選択肢もある。

### 2026-06-21: 実測プリセット追加・デフォルト化
- `src/data/presets/measured.json`: 旧 `calcStat()` の実測値（N=2653）を再現。kinds は旧 static と同じ既定値（SSR1 SR1 A2 B3 C5 D8 E10）。
- `src/data/index.ts`: `[measured, nakuru, asamiyui]` の順にし、`defaultPreset` を実測に。
- **バリデーション緩和**: 実測値・手入力はパーセント丸めで合計がぴったり1にならないため、合計上限の許容を 1e-9 → **約1%（`RATE_SUM_TOLERANCE = 0.01`）** に。旧サイトの手動モード「99〜101%」と整合。`lottery.ts` で定数を export し、`App.tsx` の警告しきい値と共有。
- テスト更新: デフォルトID=measured、合計はほぼ1（丸め誤差許容）、丸め誤差の受理/明らかな超過の拒否を追加。全563通過。
- 注意: 実測値を更新する時は `measured.json` を編集（旧コードの「ここを手動で更新する」に相当）。

### Step 3 スキップの判断（2026-06-21）
URL共有は利用見込みが低いとのことで当面見送り。必要になれば urlCodec / storage を後付けする（UI状態は App に集約済みなので接続は容易）。

### 補足: 旧モードの整理
旧 `static`(実測)・`normal/positive/negative`(コメントアウト済)は移植対象外。汎用の手動編集（Step 4）で代替する。`description` は出典表示用に追加（DESIGN初稿の `source` を改名）。

## 既存資産の扱い（2026-06-28 整理）

- `集計C++/`：スクレイピング側のリポジトリへ移管したため、本リポジトリからは**削除**。
- 旧 `index.html` / `js/script.js` / `style.css`：app/ へ完全移行したため**削除**（必要なら git 履歴から参照可）。
- リポジトリ直下は `app/`（本番）＋ 設定ファイル（`.github/` `README.md` `DESIGN.md` `.gitignore`）のみのクリーンな構成に。

## 未確定・要確認

- Tier モデル（label/rate/kinds、賞ごと独立）でよいか。per-item の非一様レートまで要るか。
- プリセットの初期表示は現行の「なくる」固定でよいか。
- パッケージマネージャ（npm / pnpm）。

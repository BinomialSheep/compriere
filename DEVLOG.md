# compriere 開発ログ（DEVLOG）

> 全面刷新の時系列の作業記録。**現在の設計・決定は [DESIGN.md](DESIGN.md) を参照。**
> 各エントリは当時の記録であり、後で変わった点は新しいエントリ／DESIGN.md が優先する。

## 当初の方針（2026-06-21）

- プロダクト方向: 完全ユーザー設定型（汎用コンプ率計算機）。ただし実測くじを目立つプリセットとして同梱し、検索流入を維持する。
- スタック: React + Vite + TypeScript。`dist/` を GitHub Pages へ。
- エンジン: 旧DPを包除原理へ作り替える。旧DPを参照実装として数値一致を検証してから採用。
- 進め方: core（エンジン）→ data → UI の順。各段で旧サイトと出力一致を確認。

## 2026-06-21

### Step 1: 確率エンジン確定（最重要）
- Vite + React 19 + TS 6 + Vitest を導入。
- `legacy-dp.ts`: 旧サイトのDPを忠実移植（検証用の参照実装。本番不使用）。
- `completion.ts`: 包除原理エンジン（本番）。`completionProbability(n,k,p)` / `atLeastOneProbability(n,p)`。
- 旧DPと 486 通りの (n,k,p) で数値一致を検証。全533テスト通過。旧DPの n>1000 破綻（`Number(cmb(...))=Infinity`）を解消。

### Step 2: データモデル
- `tsconfig` に `strict` / `resolveJsonModule` を追加（「型なし」課題への対処）。
- `lottery.ts`: `Tier` / `Lottery` 型 ＋ `parseLottery()`（実行時バリデーション、エラー全件返し）。
- `evaluate.ts`: `evaluateLottery(lottery, draws)`。
- 実測くじを `data/presets/*.json` へ外出し、`data/index.ts` でロード時検証。全557通過。

### Step 4: UI（React）
- `App.tsx` ＋ `ui/LotteryTable.tsx`: プリセット選択・くじ名・引く回数を持ち、入力即時に再計算（旧「計算」ボタン廃止）。賞の追加／削除・各値の編集が可能。不正入力の賞は «—»。
- ライト/ダーク対応のクリーンなデザインに刷新（課題「しょぼい」対応）。全557通過 / ビルド成功。
- Step 3（URL共有・localStorage）は利用見込みが低いためスキップ。UI状態は App に集約済みで後付け可能。

### 実測プリセット同梱とバリデーション緩和
- 実測プリセットを追加し、デフォルト表示に。
- 実測値・手入力はパーセント丸めで合計がぴったり1にならないため、合計上限の許容を 1e-9 → `RATE_SUM_TOLERANCE = 0.01`（約1%）に。旧サイトの手動モード「99〜101%」と整合。

### デプロイ設定（GitHub Actions → Pages）
- `vite.config.ts`: 本番ビルドのみ `base: '/compriere/'`。dev は `/`。
- `.github/workflows/deploy.yml`: push で `npm ci → test → build → dist` を Pages へ。
- go-live は Settings → Pages → Source を「GitHub Actions」に切替（手動の1回操作）。
- ハマり: Source が「Deploy from a branch」のままだと、組み込みのルート配信と自作ワークフローが競合し、push のたびに旧サイトへ戻った。Source を「GitHub Actions」にして解消。

## 2026-06-27

### プリセットを5段階(level1〜5)に整備
- 引かれる総数（人気度）に応じた5段階の実測プリセット（level1〜5）へ差し替え。デフォルトは level3「普通」。
- データチェックで2点を検出・修正: level2 のレア賞 0.05% は打ち間違い（→0.5%）、level4 の合計99%（→E賞 59%→60% で100%）。全プリセット合計100%に。

## 2026-06-28

### ディレクトリ整理（ベストプラクティス化）
- `集計C++/`: スクレイピング側リポジトリへ移管のため削除。
- 旧サイト（`index.html` / `js/script.js` / `style.css`）: app/ へ完全移行のため削除（必要なら git 履歴から参照可）。
- `app/` をリポジトリ直下へ昇格（単一アプリ構成）。README / .gitignore の重複を解消、`deploy.yml` の `working-directory: app` も撤去。`base: '/compriere/'` は変更不要。

### 桁落ちバグ修正（大きな種類数）
- 症状: 提供割合0.25%・種類数92・100回でコンプ率が誤って100%表示。
- 原因: 包除原理 `Σ(-1)^j C(k,j)(1-jp/k)^n` が、k が大きいと各項が C(k,k/2)（k=92 で約 3.6×10²⁶）まで膨らみ、符号交替の打ち消しで桁落ち。真値≈0 が丸め残差 ~1e12 のままクランプされ100%に。
- 修正: `completion.ts` をハイブリッド化。k ≤ 20 は包除原理（O(k)、大n高速）、k > 20 は占有数DP（O(n·k)、二項係数を使わず全状態[0,1]で桁落ちなし）に切替。
- k>20 を旧DP（k に強い、n≤500 で有効）と総当たり一致検証＋回帰テスト追加。全756通過。

# compriere（こんぷりえ～る）

くじを回した回数ごとの、コンプリート確率を計算する Web アプリ。

https://binomialsheep.github.io/compriere/

「1賞に複数のランダム景品があるくじ」のコンプ率を、包除原理にもとづく計算で実用的な速度で求めます。提供割合は実測ベースのプリセットを同梱しつつ、賞・種類数・確率を自由に編集できます。

## 技術構成

- React + TypeScript + Vite
- テスト: Vitest
- ホスティング: GitHub Pages（GitHub Actions で `dist/` を配信）

## 開発

```sh
npm install      # 依存をインストール
npm run dev      # 開発サーバー（http://localhost:5173/）
npm test         # テスト
npm run build    # 本番ビルド → dist/
```

## 構成

- `src/core/` … 確率計算エンジン・型・バリデーション（DOM非依存・テストあり）
- `src/data/` … 同梱プリセット（くじの提供割合データ）
- `src/ui/` … React コンポーネント
- `.github/workflows/deploy.yml` … main への push で自動デプロイ

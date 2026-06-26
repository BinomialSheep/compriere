import { useMemo, useState } from "react";
import "./App.css";
import type { Lottery, Tier } from "./core/lottery";
import { RATE_SUM_TOLERANCE } from "./core/lottery";
import { presets, defaultPreset } from "./data";
import { LotteryTable } from "./ui/LotteryTable";

/** 引く回数の入力文字列を、0以上の整数 or null（不正）に変換する */
function parseDraws(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function App() {
  const [lottery, setLottery] = useState<Lottery>(() =>
    structuredClone(defaultPreset),
  );
  const [drawsText, setDrawsText] = useState("100");

  const draws = useMemo(() => parseDraws(drawsText), [drawsText]);
  const rateSum = useMemo(
    () => lottery.tiers.reduce((sum, t) => sum + (t.rate || 0), 0),
    [lottery.tiers],
  );

  // 現在のくじがどのプリセット由来か（編集すると一致しなくなる場合がある）
  const selectedPresetId = presets.some((p) => p.id === lottery.id)
    ? lottery.id
    : "";

  function loadPreset(id: string) {
    const preset = presets.find((p) => p.id === id);
    if (preset) setLottery(structuredClone(preset));
  }

  function updateTier(index: number, patch: Partial<Tier>) {
    setLottery((l) => ({
      ...l,
      tiers: l.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }));
  }

  function addTier() {
    setLottery((l) => ({
      ...l,
      tiers: [...l.tiers, { label: "新しい賞", rate: 0, kinds: 1 }],
    }));
  }

  function removeTier(index: number) {
    setLottery((l) => ({
      ...l,
      tiers: l.tiers.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>こんぷりえ～る</h1>
        <p className="tagline">
          くじを回した回数ごとの、コンプリート確率を計算します。
        </p>
      </header>

      <section className="controls">
        <label className="field">
          <span className="field-label">プリセット</span>
          <select
            value={selectedPresetId}
            onChange={(e) => loadPreset(e.target.value)}
          >
            {selectedPresetId === "" && (
              <option value="">カスタム（編集中）</option>
            )}
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">くじの名前</span>
          <input
            type="text"
            value={lottery.name}
            onChange={(e) =>
              setLottery((l) => ({ ...l, name: e.target.value }))
            }
          />
        </label>

        <label className="field field-draws">
          <span className="field-label">引く回数</span>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={drawsText}
            onChange={(e) => setDrawsText(e.target.value)}
          />
        </label>
      </section>

      {draws === null && (
        <p className="warning">引く回数は0以上の整数で入力してください。</p>
      )}
      {rateSum > 1 + RATE_SUM_TOLERANCE && (
        <p className="warning">
          提供割合の合計が100%を大きく超えています（現在 {formatSum(rateSum)}）。1回の抽選で出る賞は1つなので、合計は100%以下にしてください。
        </p>
      )}

      <LotteryTable
        tiers={lottery.tiers}
        draws={draws}
        onUpdateTier={updateTier}
        onRemoveTier={removeTier}
        onAddTier={addTier}
      />

      <p className="rate-sum">提供割合の合計: {formatSum(rateSum)}</p>

      {lottery.description && (
        <p className="description">{lottery.description}</p>
      )}

      <footer className="app-footer">
        <p>
          「コンプ率」は全種類を引き当てる確率、「1個以上出る率」はその賞が最低1個出る確率です。
        </p>
      </footer>
    </div>
  );
}

function formatSum(rateSum: number): string {
  return (rateSum * 100).toFixed(1) + "%";
}

export default App;

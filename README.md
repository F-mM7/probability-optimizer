# Probability Optimizer

## 概要

確率最適化計算ツール - 制約条件下での期待値最大化問題を解決するWebアプリケーション

制約条件 `2p + r = C` のもとで期待値を最大化する最適な確率pと倍率rを探索し、視覚的に分析結果を表示します。

## デモ

[Probability Optimizer](https://F-mM7.github.io/probability-optimizer/)

## 機能

### 主要機能
- **最適解探索**: 三分探索アルゴリズムによる高精度な最適解の計算
- **リアルタイム計算**: パラメータ変更時の即座の再計算
- **感度分析**: 制約条件Cの変化に対する最適解の感度を可視化
- **複数グラフ表示**:
  - p-r空間での期待値等高線図と最適点表示
  - パラメータA変化時の最適解の推移
  - 制約条件C変化時の期待値の変動

### 入力パラメータ
- **p**: 初期確率 (0 ≤ p ≤ 1)
- **r**: 倍率 (r > 0)
- **N**: 試行回数 (1 ≤ N ≤ 100, 整数)
- **A**: 基準値 (1 ≤ A ≤ 100, 整数)

### 計算結果
- 最適確率 (p*)
- 最適倍率 (r*)
- 最大期待値
- 制約条件の値 (C)

## 技術スタック

- React 18
- TypeScript
- Vite
- Chart.js / react-chartjs-2 (グラフ描画)
- CSS Grid/Flexbox (レスポンシブレイアウト)

## アルゴリズム

### 最適化手法
- **三分探索**: O(log n)の計算量で単峰性関数の最大値を探索
- **許容誤差**: 0.0001の高精度計算
- **浮動小数点誤差対策**: 境界付近での精度保証

### 数学的背景
制約条件 `2p + r = C` のもとで、期待値関数 `E(p, r, N, A)` を最大化する問題を解きます。

## セットアップ

```bash
git clone https://github.com/F-mM7/probability-optimizer.git
cd probability-optimizer
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## スクリプト

- `npm run dev` - 開発サーバーの起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run typecheck` - TypeScript型チェック
- `npm run lint` - ESLintによるコード検査
- `npm run format` - Prettierによるコード整形

## ライセンス

MIT

## 作者

F-mM7
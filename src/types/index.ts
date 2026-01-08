/**
 * 型定義
 */

/**
 * 入力パラメータ
 */
export interface InputParameters {
  p: number; // 確率 (0 ≤ p ≤ 1)
  r: number; // 高報酬の値 (r > 0)
  N: number; // 試行回数 (N ≥ 1)
  A: number; // セット数 (A ≥ 1)
}

/**
 * 計算結果
 */
export interface CalculationResult {
  optimalP: number;      // 最適な確率
  optimalR: number;      // 最適なrの値
  maxExpectation: number; // 最大期待値
  constraintC: number;    // 制約条件の定数 (2p + r = C)
}

/**
 * グラフ用データポイント
 */
export interface DataPoint {
  p: number;
  r: number;
  expectation: number;
}

/**
 * グラフ表示用データ
 */
export interface ChartData {
  sensitivityData: DataPoint[];  // 感度分析データ
  optimalPoint: DataPoint;        // 最適点
  baseA?: number;                  // 基準となるAの値（オプション）
  varyingAData?: {                // Aを変化させた時のデータ（オプション）
    A: number;
    optimalP: number;
    expectation: number;
  }[];
  varyingCData?: {                // Cを変化させた時のデータ（オプション）
    C: number;
    optimalP: number;
    optimalR: number;
    expectation: number;
  }[];
}
/**
 * 確率計算のコアロジック
 */

/**
 * 二項係数を計算
 */
function binomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/**
 * 確率変数Sの確率分布を計算
 * @param N 試行回数
 * @param p 高報酬を得る確率
 * @param r 高報酬の値
 * @returns 確率分布の配列 [値, 確率]のペア
 */
export function calculateSDistribution(N: number, p: number, r: number): Map<number, number> {
  const distribution = new Map<number, number>();

  // 特殊ケースの処理
  // 浮動小数点の誤差を考慮して、rが1に非常に近い場合も特殊ケースとして扱う
  if (Math.abs(r - 1) < 1e-10) {
    // r ≈ 1の場合、S = N（定数）
    distribution.set(N, 1);
    return distribution;
  }

  if (p === 0) {
    // p = 0の場合、S = N（確率1）
    distribution.set(N, 1);
    return distribution;
  }

  if (p === 1) {
    // p = 1の場合、S = Nr（確率1）
    distribution.set(N * r, 1);
    return distribution;
  }

  // 一般的なケース：二項分布
  for (let k = 0; k <= N; k++) {
    // k回成功した場合の値: k * r + (N - k) * 1 = N + k(r - 1)
    const value = N + k * (r - 1);
    const probability = binomialCoefficient(N, k) * Math.pow(p, k) * Math.pow(1 - p, N - k);
    distribution.set(value, probability);
  }

  return distribution;
}

/**
 * 最大値の期待値を計算
 * @param sDistribution 確率変数Sの確率分布
 * @param A 独立な試行セット数
 * @returns 最大値の期待値
 */
export function calculateMaxExpectation(sDistribution: Map<number, number>, A: number): number {
  // Sの値を昇順にソート
  const sortedValues = Array.from(sDistribution.keys()).sort((a, b) => a - b);

  // 分布が一点に集中している場合の最適化
  if (sortedValues.length === 1) {
    // 分布が一点に集中している場合、その値が必ず最大値となる
    return sortedValues[0];
  }

  // 累積分布関数（CDF）を計算
  const cdf = new Map<number, number>();
  let cumulative = 0;
  for (const value of sortedValues) {
    cumulative += sDistribution.get(value)!;
    cdf.set(value, cumulative);
  }

  // 最大値の期待値を計算
  // E[max] = Σ x * P(max = x)
  // P(max = x) = P(S ≤ x)^A - P(S < x)^A
  let expectation = 0;
  let prevCdf = 0;

  for (const value of sortedValues) {
    const currentCdf = cdf.get(value)!;
    // P(max = value) = P(S ≤ value)^A - P(S < value)^A
    const probMaxEqualsValue = Math.pow(currentCdf, A) - Math.pow(prevCdf, A);
    expectation += value * probMaxEqualsValue;
    prevCdf = currentCdf;
  }

  return expectation;
}

/**
 * 制約条件のもとでrを計算
 * @param p 確率
 * @param C 定数（2p + r = C）
 * @returns r の値
 */
export function calculateR(p: number, C: number): number {
  return C - 2 * p;
}

/**
 * 指定されたパラメータで期待値を計算
 * @param p 確率
 * @param N 試行回数
 * @param A セット数
 * @param C 制約定数
 * @returns 期待値
 */
export function calculateExpectationForP(p: number, N: number, A: number, C: number): number {
  const r = calculateR(p, C);

  // rが1未満の場合は無効（倍率は1以上である必要がある）
  if (r < 1) {
    return -Infinity;
  }

  const sDistribution = calculateSDistribution(N, p, r);
  return calculateMaxExpectation(sDistribution, A);
}

/**
 * 最適なpを探索（三分探索）
 * @param N 試行回数
 * @param A セット数
 * @param C 制約定数
 * @param tolerance 収束判定の閾値（デフォルト: 0.00001）
 * @returns { optimalP, optimalR, maxExpectation }
 */
export function findOptimalP(
  N: number,
  A: number,
  C: number,
  tolerance: number = 0.00001
): { optimalP: number; optimalR: number; maxExpectation: number } {
  // pの範囲を決定
  // 2p + r = C かつ r >= 1 より、p <= (C - 1) / 2
  // また、0 ≤ p ≤ 1

  // C < 1の場合、r >= 1を満たす解が存在しない
  if (C < 1) {
    return {
      optimalP: 0,
      optimalR: 1,
      maxExpectation: N,
    };
  }

  let left = 0;
  let right = Math.min(1, (C - 1) / 2);

  // 三分探索
  // 期待値関数が単峰性（一つの極大値を持つ）と仮定
  while (right - left > tolerance) {
    // 範囲を3等分する2つの点
    const mid1 = left + (right - left) / 3;
    const mid2 = right - (right - left) / 3;

    // 各点での期待値を計算
    const expectation1 = calculateExpectationForP(mid1, N, A, C);
    const expectation2 = calculateExpectationForP(mid2, N, A, C);

    // より良い期待値を持つ側に範囲を縮小
    if (expectation1 < expectation2) {
      left = mid1;
    } else {
      right = mid2;
    }
  }

  // 最終的な最適点を決定
  const optimalP = (left + right) / 2;
  const maxExpectation = calculateExpectationForP(optimalP, N, A, C);
  const optimalR = calculateR(optimalP, C);

  return {
    optimalP,
    optimalR,
    maxExpectation,
  };
}

/**
 * 感度分析：pを変化させたときの期待値の推移
 * @param N 試行回数
 * @param A セット数
 * @param C 制約定数
 * @param step ステップ幅（デフォルト: 0.01）
 * @returns { p, r, expectation }の配列
 */
export function sensitivityAnalysis(
  N: number,
  A: number,
  C: number,
  step: number = 0.01
): Array<{ p: number; r: number; expectation: number }> {
  const results = [];

  // C < 1の場合、r >= 1を満たす解が存在しない
  if (C < 1) {
    // p = 0, r = 1 の1点のみ
    results.push({ p: 0, r: 1, expectation: N });
    return results;
  }

  // r >= 1 の制約から、p <= (C - 1) / 2
  const maxP = Math.min(1, (C - 1) / 2);

  // 浮動小数点誤差を避けるため、インデックスベースでpを計算
  const numSteps = Math.floor(maxP / step);

  for (let i = 0; i <= numSteps; i++) {
    // インデックスからpを計算（累積誤差を回避）
    let p = i * step;

    // 最後の点がmaxPを超えないように調整
    if (p > maxP) {
      p = maxP;
    }

    const r = calculateR(p, C);
    const expectation = calculateExpectationForP(p, N, A, C);

    if (expectation !== -Infinity) {
      results.push({ p, r, expectation });
    }
  }

  // maxPが最後の点より大きい場合、maxPの点も追加
  const lastP = numSteps * step;
  if (lastP < maxP) {
    const r = calculateR(maxP, C);
    const expectation = calculateExpectationForP(maxP, N, A, C);
    if (expectation !== -Infinity) {
      results.push({ p: maxP, r, expectation });
    }
  }

  return results;
}

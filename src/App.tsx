import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { InputForm } from './components/InputForm';
import { ResultDisplay } from './components/ResultDisplay';
import { ChartDisplay } from './components/ChartDisplay';
import { InputParameters, CalculationResult, ChartData } from './types';
import { findOptimalP, sensitivityAnalysis } from './utils/probabilityCalculator';

function App() {
  const [parameters, setParameters] = useState<InputParameters>({
    p: 0.3,
    r: 2.0,
    N: 30,
    A: 50,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 計算処理
  const performCalculation = useCallback(() => {
    // 入力パラメータが有効かどうかをチェック
    const isValidParameters = () => {
      return (
        parameters.p >= 0 &&
        parameters.p <= 1 &&
        parameters.r > 0 &&
        parameters.N >= 1 &&
        parameters.N <= 100 &&
        parameters.A >= 1 &&
        parameters.A <= 100 &&
        Number.isInteger(parameters.N) &&
        Number.isInteger(parameters.A)
      );
    };

    if (!isValidParameters()) {
      return;
    }

    setIsCalculating(true);

    try {
      // 制約条件の定数Cを計算
      const C = 2 * parameters.p + parameters.r;

      // 最適解を探索
      const optimal = findOptimalP(parameters.N, parameters.A, C);

      // 結果を設定
      const calculationResult: CalculationResult = {
        optimalP: optimal.optimalP,
        optimalR: optimal.optimalR,
        maxExpectation: optimal.maxExpectation,
        constraintC: C,
      };
      setResult(calculationResult);

      // 感度分析
      const sensitivity = sensitivityAnalysis(parameters.N, parameters.A, C);

      // Aを変化させたときのデータ（オプション）
      const varyingA = [];
      const baseA = parameters.A;
      // 範囲を1から2Aに固定
      const minA = 1;
      const maxA = baseA * 2;
      const stepA = 1;

      for (let A = minA; A <= maxA; A += stepA) {
        const optimalForA = findOptimalP(parameters.N, A, C);
        varyingA.push({
          A,
          optimalP: optimalForA.optimalP,
          expectation: optimalForA.maxExpectation,
        });
      }

      // Cを変化させたときのデータ（オプション）
      const varyingC = [];
      const baseC = C;
      // Cの範囲を適切に設定（baseC ± 1または0.5〜1.5倍の狭い方）
      const minC = Math.max(0.1, Math.min(baseC - 1, baseC * 0.5));
      const maxC = Math.max(baseC + 1, baseC * 1.5);
      const stepC = (maxC - minC) / 50; // 50点でサンプリング

      for (let currentC = minC; currentC <= maxC; currentC += stepC) {
        const optimalForC = findOptimalP(parameters.N, parameters.A, currentC);
        varyingC.push({
          C: currentC,
          optimalP: optimalForC.optimalP,
          optimalR: optimalForC.optimalR,
          expectation: optimalForC.maxExpectation,
        });
      }

      // グラフデータを設定
      const graphData: ChartData = {
        sensitivityData: sensitivity,
        optimalPoint: {
          p: optimal.optimalP,
          r: optimal.optimalR,
          expectation: optimal.maxExpectation,
        },
        baseA: parameters.A,
        varyingAData: varyingA,
        varyingCData: varyingC,
      };
      setChartData(graphData);
    } catch (error) {
      console.error('計算エラー:', error);
      alert('計算中にエラーが発生しました。入力値を確認してください。');
    } finally {
      setIsCalculating(false);
    }
  }, [parameters]);

  // パラメータが変更されたら自動的に計算を実行
  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation();
    }, 300); // 300ms のデバウンス

    return () => clearTimeout(timer);
  }, [parameters, performCalculation]);

  return (
    <div className="app">
      <main className="app-main">
        <div className="content-container">
          <div className="left-column">
            <InputForm parameters={parameters} onParameterChange={setParameters} />

            {result && !isCalculating && <ResultDisplay result={result} />}
          </div>

          <div className="right-column">
            {isCalculating && <div className="loading">計算中...</div>}

            {chartData && !isCalculating && <ChartDisplay data={chartData} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

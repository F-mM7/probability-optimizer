import React from 'react';
import { CalculationResult } from '../types';

interface ResultDisplayProps {
  result: CalculationResult | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="result-display">
      <h2>計算結果</h2>
      <div className="result-grid">
        <div className="result-group">
          <label>最適確率 p*</label>
          <div className="result-value-box">
            {result.optimalP.toFixed(4)}
          </div>
        </div>

        <div className="result-group">
          <label>最適倍率 r*</label>
          <div className="result-value-box">
            {result.optimalR.toFixed(4)}
          </div>
        </div>

        <div className="result-group">
          <label>最大期待値 E*</label>
          <div className="result-value-box">
            {result.maxExpectation.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
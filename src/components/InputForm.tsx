import React from 'react';
import { InputParameters } from '../types';

interface InputFormProps {
  parameters: InputParameters;
  onParameterChange: (params: InputParameters) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  parameters,
  onParameterChange
}) => {
  const handleChange = (field: keyof InputParameters) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      onParameterChange({
        ...parameters,
        [field]: value
      });
    }
  };

  const isValid = () => {
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

  return (
    <div className="input-form">
      <h2>入力パラメータ</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="p">
            確率 p
          </label>
          <input
            id="p"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={parameters.p}
            onChange={handleChange('p')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="r">
            倍率 r
          </label>
          <input
            id="r"
            type="number"
            min="0.01"
            step="0.01"
            value={parameters.r}
            onChange={handleChange('r')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="N">
            回数 N
          </label>
          <input
            id="N"
            type="number"
            min="1"
            max="100"
            step="1"
            value={parameters.N}
            onChange={handleChange('N')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="A">
            セット数 A
          </label>
          <input
            id="A"
            type="number"
            min="1"
            max="100"
            step="1"
            value={parameters.A}
            onChange={handleChange('A')}
          />
        </div>
      </div>

      {!isValid() && (
        <div className="error-message">
          入力値が範囲外です。各パラメータの制約を確認してください。
        </div>
      )}
    </div>
  );
};
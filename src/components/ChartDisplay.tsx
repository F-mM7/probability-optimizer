import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData as AppChartData } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartDisplayProps {
  data: AppChartData | null;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({ data }) => {
  if (!data || !data.sensitivityData || data.sensitivityData.length === 0) {
    return null;
  }

  // 最適点のx座標に最も近いインデックスを見つける
  const findClosestIndex = (targetP: number): number => {
    let minDistance = Infinity;
    let closestIndex = 0;
    data.sensitivityData.forEach((d, index) => {
      const distance = Math.abs(d.p - targetP);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const optimalIndex = findClosestIndex(data.optimalPoint.p);

  // グラフ1: 感度分析（pを変化させたときのEの変化）
  const sensitivityChartData = {
    labels: data.sensitivityData.map((d) => d.p.toFixed(3)),
    datasets: [
      {
        label: '期待値 E',
        data: data.sensitivityData.map((d) => d.expectation),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      // 最適点を独立した点として追加（最適なp値に最も近い位置に配置）
      {
        label: '最適点',
        data: data.sensitivityData.map((_, index) =>
          index === optimalIndex ? data.optimalPoint.expectation : null
        ),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false,
      },
    ],
  };

  const sensitivityOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e0e0e0',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: '感度分析: 確率pに対する期待値Eの変化',
        position: 'bottom' as const,
        color: '#e0e0e0',
        font: {
          size: 14,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 0,
        },
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const index = context[0].dataIndex;
            const p = data.sensitivityData[index].p;
            return `確率 p: ${p.toFixed(4)}`;
          },
          label: function (context) {
            if (context.dataset.label === '最適点') {
              return `最適点 E: ${context.parsed.y?.toFixed(4) || ''}`;
            }
            const index = context.dataIndex;
            const r = data.sensitivityData[index].r;
            const e = data.sensitivityData[index].expectation;
            return [
              `r: ${r.toFixed(4)}`,
              `E: ${e.toFixed(4)}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '確率 p',
          color: '#e0e0e0',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: '#b0b0b0',
          maxTicksLimit: 21, // 0.00から1.00まで0.05刻みで最大21個
          callback: function (_value: unknown, index: number) {
            const p = data.sensitivityData[index]?.p;
            return p !== undefined ? p.toFixed(2) : '';
          },
        },
        grid: {
          color: '#404040',
        },
      },
      y: {
        title: {
          display: true,
          text: '期待値 E',
          color: '#e0e0e0',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: '#b0b0b0',
        },
        grid: {
          color: '#404040',
        },
      },
    },
  };

  // グラフ2: Aを変化させたときのデータ（もしあれば）
  let varyingAChart = null;
  if (data.varyingAData && data.varyingAData.length > 0) {
    const varyingAChartData = {
      datasets: [
        {
          label: '最適確率 p*',
          data: data.varyingAData.map((d) => ({ x: d.A, y: d.optimalP })),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y',
        },
        {
          label: '最大期待値 E*',
          data: data.varyingAData.map((d) => ({ x: d.A, y: d.expectation })),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y1',
        },
      ],
    };

    const varyingAOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: 'セット数感度分析: Aの変化に対する最適確率と最大期待値',
          position: 'bottom' as const,
          color: '#e0e0e0',
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 0,
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          min: 1,
          max: data.baseA ? data.baseA * 2 : 100,
          title: {
            display: true,
            text: 'セット数 A',
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
          ticks: {
            color: '#b0b0b0',
            stepSize: Math.ceil((data.baseA ? data.baseA * 2 - 1 : 99) / 10),
          },
          grid: {
            color: '#404040',
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '最適確率 p*',
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
          ticks: {
            color: '#b0b0b0',
          },
          grid: {
            color: '#404040',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: '最大期待値 E*',
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
          ticks: {
            color: '#b0b0b0',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    varyingAChart = (
      <div className="chart-container">
        <Line data={varyingAChartData} options={varyingAOptions} />
      </div>
    );
  }

  // グラフ3: Cを変化させたときのデータ（もしあれば）
  let varyingCChart = null;
  if (data.varyingCData && data.varyingCData.length > 0) {
    const varyingCChartData = {
      labels: data.varyingCData.map((d) => d.C.toFixed(2)),
      datasets: [
        {
          label: '最適確率 p*',
          data: data.varyingCData.map((d) => d.optimalP),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y',
        },
        {
          label: '最適倍率 r*',
          data: data.varyingCData.map((d) => d.optimalR),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y',
        },
      ],
    };

    const varyingCOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: true,
          text: '制約条件感度分析: C (=2p+r) の変化に対する最適確率と最適倍率',
          position: 'bottom' as const,
          color: '#e0e0e0',
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 0,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '制約定数 C (= 2p + r)',
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
          ticks: {
            color: '#b0b0b0',
            maxTicksLimit: 10,
          },
          grid: {
            color: '#404040',
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: '最適確率 p* / 最適倍率 r*',
            color: '#e0e0e0',
            font: {
              size: 12,
            },
          },
          ticks: {
            color: '#b0b0b0',
          },
          grid: {
            color: '#404040',
          },
        },
      },
    };

    varyingCChart = (
      <div className="chart-container">
        <Line data={varyingCChartData} options={varyingCOptions} />
      </div>
    );
  }

  return (
    <div className="chart-display">
      <h2>グラフ表示</h2>
      <div className="chart-container">
        <Line data={sensitivityChartData} options={sensitivityOptions} />
      </div>
      {varyingAChart}
      {varyingCChart}
    </div>
  );
};

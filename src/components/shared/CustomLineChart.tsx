import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import color from '../../data/color';
import { formatNumber } from '../../util';

interface Series {
  name: string;
  dataKey: string;
  fill?: string;
  stroke?: string;
}

interface Props {
  data: Record<string, string | number>[];
  series: Series[];
  showLegend?: boolean;
}

export default function CustomLineChart({ data, series, showLegend = true }: Props) {
  const initialEnabledLines: Record<string, boolean> = {};
  series.forEach(s => initialEnabledLines[s.name] = true);
  const [enabledLines, setEnabledLines] = useState(initialEnabledLines);

  const handleLegendClick = (o: { value?: string }) => {
    if (!o.value) return;
    setEnabledLines(prevState => ({
      ...prevState,
      [o.value!]: !prevState[o.value!]
    }));
  };

  return (
    <div className="chart">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="key" />
          <YAxis />
          {showLegend && <Legend
            verticalAlign="top"
            onClick={handleLegendClick}
          />}
          <Tooltip formatter={(v: string | number) => formatNumber(v, { maximumFractionDigits: 0 })} />
          {series.map(s => {
            const fill = s.fill || color.theme.dark;
            const stroke = s.stroke || color.theme.dark;
            return (
              <Line
                type="monotone"
                name={s.name}
                key={s.name + s.dataKey}
                dataKey={enabledLines[s.name] ? s.dataKey : ''}
                fill={fill}
                stroke={stroke}
                dot={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

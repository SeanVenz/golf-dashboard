import {
  ResponsiveContainer,
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis,
} from 'recharts';

export default function ScatterChart({
  data,
  xKey,
  yKey,
  xLabel,
  yLabel,
  color = '#6366f1',
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsScatter margin={{ top: 10, right: 10, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey={xKey}
          name={xLabel || xKey}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={{ stroke: '#334155' }}
          tickLine={false}
          label={xLabel ? { value: xLabel, position: 'bottom', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <YAxis
          dataKey={yKey}
          name={yLabel || yKey}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={45}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 } : undefined}
        />
        <ZAxis range={[30, 30]} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(val, name) => [typeof val === 'number' ? val.toFixed(2) : val, name]}
        />
        <Scatter data={data} fill={color} fillOpacity={0.6} />
      </RechartsScatter>
    </ResponsiveContainer>
  );
}

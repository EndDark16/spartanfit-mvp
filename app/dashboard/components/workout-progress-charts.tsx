"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type ChartData = {
  exerciseName: string;
  absoluteMax: number;
  data: { date: string; maxWeight: number }[];
};

export function WorkoutProgressCharts({ chartsData }: { chartsData: ChartData[] }) {
  if (!chartsData || chartsData.length === 0) {
    return (
      <div className="text-zinc-500 text-sm mt-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        Aún no tienes registros de entrenamiento. ¡Agrega tu primer entrenamiento para ver tus gráficas!
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartsData.map((chart) => (
        <div key={chart.exerciseName} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg capitalize truncate pr-4">
              {chart.exerciseName}
            </h3>
            <span className="text-xs font-bold bg-zinc-800 text-zinc-300 py-1 px-3 rounded-full shrink-0">
              Max: {chart.absoluteMax}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#a1a1aa" 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#a1a1aa" 
                  tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '0.5rem' }}
                  itemStyle={{ color: '#c22524', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxWeight" 
                  name="Peso Máximo" 
                  stroke="#c22524" 
                  strokeWidth={3}
                  dot={{ fill: '#18181b', stroke: '#c22524', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#c22524' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

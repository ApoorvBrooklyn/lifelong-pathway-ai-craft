
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SkillData {
  name: string;
  value: number;
  color: string;
}

interface SkillsRadarChartProps {
  data: SkillData[];
}

const SkillsRadarChart = ({ data }: SkillsRadarChartProps) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [`${value}%`, props.payload.name]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsRadarChart;

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type DataPoint = {
  timestamp: string;
  value: number;
  parameter: string;
  location: string;
};

type EnvironmentDataProps = {
  data: DataPoint[];
  title: string;
};

export const EnvironmentData = ({ data, title }: EnvironmentDataProps) => {
  const formattedData = data.map((point) => ({
    ...point,
    timestamp: new Date(point.timestamp).toLocaleDateString(),
  }));

  return (
    <div className="w-full p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <LineChart width={600} height={300} data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

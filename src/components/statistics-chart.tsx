'use client'

import { memo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type LineProps,
} from "recharts"

type StatisticsPoint = {
  month: string
  requests: number
  matches: number
}

interface StatisticsChartProps {
  data: StatisticsPoint[]
  lineProps?: Partial<Pick<LineProps, "strokeWidth">>
}

function StatisticsChartComponent({ data, lineProps }: StatisticsChartProps) {
  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="requests"
            stroke="#3b82f6"
            dot={{ fill: "#3b82f6", r: 4 }}
            name="คำขอ"
            strokeWidth={lineProps?.strokeWidth ?? 2}
          />
          <Line
            type="monotone"
            dataKey="matches"
            stroke="#10b981"
            dot={{ fill: "#10b981", r: 4 }}
            name="การจับคู่"
            strokeWidth={lineProps?.strokeWidth ?? 2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const StatisticsChart = memo(StatisticsChartComponent)

export default StatisticsChart

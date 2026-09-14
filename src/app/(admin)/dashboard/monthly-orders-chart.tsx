"use client"

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { DashboardMonthlyOrders } from "@/lib/types"

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  fontSize: 12,
}

export function MonthlyOrdersChart({ data }: { data: DashboardMonthlyOrders }) {
  const currentYearKey = String(data.currentYearLabel)
  const previousYearKey = String(data.previousYearLabel)

  const chartData = data.months.map((month, index) => ({
    month,
    [currentYearKey]: data.currentYear[index],
    [previousYearKey]: data.previousYear[index],
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="plainline" />
        <Line
          type="monotone"
          dataKey={currentYearKey}
          name={currentYearKey}
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey={previousYearKey}
          name={previousYearKey}
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--chart-2)", strokeWidth: 2, stroke: "var(--card)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

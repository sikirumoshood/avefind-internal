"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { categoryLabel } from "@/lib/dashboard"
import type { DashboardCategoryBreakdown } from "@/lib/types"

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
]

export function CategoryPieChart({ data }: { data: DashboardCategoryBreakdown[] }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto w-full max-w-64 shrink-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              outerRadius={95}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => {
                const payload = entry.payload as DashboardCategoryBreakdown
                return [`${value} orders (${payload.percentage}%)`, categoryLabel(payload.category)]
              }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--popover-foreground)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full flex-1 space-y-2 text-sm">
        {data.map((entry, index) => (
          <li key={entry.category} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{categoryLabel(entry.category)}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {entry.count} · {entry.percentage}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

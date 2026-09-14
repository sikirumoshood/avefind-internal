import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Trend = {
  value: string
  direction: "up" | "down" | "flat"
}

type StatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  trend?: Trend
  className?: string
}

const trendConfig: Record<Trend["direction"], { icon: LucideIcon; className: string }> = {
  up: { icon: ArrowUpRight, className: "text-success" },
  down: { icon: ArrowDownRight, className: "text-destructive" },
  flat: { icon: Minus, className: "text-muted-foreground" },
}

/** Summary tile used across Dashboard analytics and per-module KPI rows. */
export function StatCard({ label, value, icon: Icon, hint, trend, className }: StatCardProps) {
  const TrendIcon = trend ? trendConfig[trend.direction].icon : null

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {(hint || trend) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {trend ? (
              <span className={cn("flex items-center gap-0.5 font-medium", trendConfig[trend.direction].className)}>
                {TrendIcon ? <TrendIcon className="size-3" /> : null}
                {trend.value}
              </span>
            ) : null}
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

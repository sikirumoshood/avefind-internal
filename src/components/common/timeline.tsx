import { format } from "date-fns"

import { type StatusTone } from "@/components/common/status-badge"
import { cn } from "@/lib/utils"

export type TimelineItem = {
  id: string
  title: string
  timestamp: string
  description?: string | null
  tone?: StatusTone
}

const DOT_TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground/50",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
}

/** Generic vertical status/event timeline — reused wherever a history of dated events needs showing. */
export function Timeline({ items, emptyLabel = "No history yet." }: { items: TimelineItem[]; emptyLabel?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ol className="space-y-6 border-l border-border pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={cn(
              "absolute top-1 -left-[29px] size-3 rounded-full border-2 border-card",
              DOT_TONE_CLASSES[item.tone ?? "neutral"],
            )}
          />
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(item.timestamp), "MMM d, yyyy p")}</p>
          {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
        </li>
      ))}
    </ol>
  )
}

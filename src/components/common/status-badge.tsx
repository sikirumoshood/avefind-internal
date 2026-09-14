import { cn } from "@/lib/utils"

export type StatusTone = "neutral" | "success" | "warning" | "destructive" | "info"

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  destructive: "bg-destructive/10 text-destructive border-destructive/25",
  info: "bg-info/15 text-info border-info/25",
}

type StatusBadgeProps = {
  label: string
  tone?: StatusTone
  className?: string
}

/**
 * Generic tone-based badge. Modules map their own status enums to a tone
 * (see e.g. ORDER_STATUS_TONE once the Orders module lands) rather than
 * hardcoding colors per screen.
 */
export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        toneClasses[tone],
        className,
      )}
    >
      {label.toLowerCase().replaceAll("_", " ")}
    </span>
  )
}

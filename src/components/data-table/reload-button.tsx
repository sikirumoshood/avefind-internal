"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Re-fetches the current server-rendered page's data. Shared by every module's table toolbar. */
export function ReloadButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn("shrink-0", className)}
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      aria-label="Reload"
    >
      <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
    </Button>
  )
}

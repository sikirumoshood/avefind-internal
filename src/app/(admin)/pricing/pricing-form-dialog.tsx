"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PRICING_FIELD_GROUPS } from "@/lib/pricing"
import type { AdminPricing } from "@/lib/types"
import type { CreatePricingInput } from "@/lib/api/pricing"

import { createPricingAction } from "./actions"

export function PricingFormDialog({ current }: { current: AdminPricing | null }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Pencil /> {current ? "Update pricing" : "Set up pricing"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{current ? "Update pricing" : "Set up pricing"}</DialogTitle>
          <DialogDescription>
            This creates a new pricing version and retires the current one — past orders keep the pricing they were
            placed under.
          </DialogDescription>
        </DialogHeader>
        {open ? <PricingForm current={current} onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function PricingForm({ current, onClose }: { current: AdminPricing | null; onClose: () => void }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const group of PRICING_FIELD_GROUPS) {
      for (const field of group.fields) {
        const existing = current?.[field.key as keyof AdminPricing]
        initial[field.key] = existing === null || existing === undefined ? "" : String(existing)
      }
    }
    return initial
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formId = useId()

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    setError(null)

    const payload: Record<string, number> = {}
    for (const group of PRICING_FIELD_GROUPS) {
      for (const field of group.fields) {
        const raw = values[field.key]
        if (!raw) {
          if (!field.optional) {
            setError(`${field.label} is required.`)
            return
          }
          continue
        }
        const parsed = Number(raw)
        if (Number.isNaN(parsed)) {
          setError(`${field.label} must be a number.`)
          return
        }
        payload[field.key] = parsed
      }
    }

    startTransition(async () => {
      const result = await createPricingAction(payload as CreatePricingInput)
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success("Pricing updated.")
      onClose()
      router.refresh()
    })
  }

  return (
    <>
      <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {PRICING_FIELD_GROUPS.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="text-sm font-medium">{group.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {group.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`${formId}-${field.key}`}>
                    {field.label}
                    {field.optional ? <span className="text-muted-foreground"> (optional)</span> : null}
                  </Label>
                  <Input
                    id={`${formId}-${field.key}`}
                    type="number"
                    step="any"
                    value={values[field.key]}
                    onChange={(event) => handleChange(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save new pricing
        </Button>
      </DialogFooter>
    </>
  )
}

"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DISCOUNT_PURPOSE_LABELS, DISCOUNT_TYPE_LABELS } from "@/lib/discounts"
import type { DiscountPurpose, DiscountType } from "@/lib/types"

import { createDiscountAction } from "./actions"

export function DiscountFormDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> New discount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create discount</DialogTitle>
          <DialogDescription>
            Scope to a merchant, store, or single user — or leave all three blank for a platform-wide promo code.
          </DialogDescription>
        </DialogHeader>
        {open ? <DiscountForm onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function DiscountForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [type, setType] = useState<DiscountType>("PERCENTAGE")
  const [value, setValue] = useState("")
  const [purpose, setPurpose] = useState<DiscountPurpose>("PROMOTION")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isAutoApplicable, setIsAutoApplicable] = useState(false)
  const [maxNumberOfUse, setMaxNumberOfUse] = useState("")
  const [maxDiscountedAmount, setMaxDiscountedAmount] = useState("")
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("")
  const [merchantId, setMerchantId] = useState("")
  const [storeId, setStoreId] = useState("")
  const [userId, setUserId] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const codeId = useId()
  const valueId = useId()
  const startId = useId()
  const endId = useId()
  const maxUseId = useId()
  const maxDiscountId = useId()
  const minOrderId = useId()
  const merchantIdFieldId = useId()
  const storeIdFieldId = useId()
  const userIdFieldId = useId()
  const descriptionId = useId()

  function handleSubmit() {
    setError(null)

    if (!code.trim()) return setError("A code is required.")
    if (!value || Number(value) <= 0) return setError("Enter a positive value.")
    if (!startDate || !endDate) return setError("Start and end dates are required.")

    startTransition(async () => {
      const result = await createDiscountAction({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        purpose,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isAutoApplicable,
        maxNumberOfUse: maxNumberOfUse ? Number(maxNumberOfUse) : undefined,
        maxDiscountedAmount: maxDiscountedAmount ? Number(maxDiscountedAmount) : undefined,
        minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : undefined,
        merchantId: merchantId.trim() || undefined,
        storeId: storeId.trim() || undefined,
        userId: userId.trim() || undefined,
        description: description.trim() || undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Discount created.")
      onClose()
      router.refresh()
    })
  }

  return (
    <>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={codeId}>Code</Label>
            <Input id={codeId} value={code} maxLength={15} onChange={(event) => setCode(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select value={purpose} onValueChange={(v) => setPurpose(v as DiscountPurpose)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DISCOUNT_PURPOSE_LABELS) as [DiscountPurpose, string][]).map(([v, label]) => (
                  <SelectItem key={v} value={v}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DiscountType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DISCOUNT_TYPE_LABELS) as [DiscountType, string][]).map(([v, label]) => (
                  <SelectItem key={v} value={v}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={valueId}>Value{type === "PERCENTAGE" ? " (%)" : " (₦)"}</Label>
            <Input id={valueId} type="number" min={0} value={value} onChange={(event) => setValue(event.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={startId}>Start date</Label>
            <Input
              id={startId}
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={endId}>End date</Label>
            <Input id={endId} type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div>
            <p className="text-sm font-medium">Auto-apply</p>
            <p className="text-xs text-muted-foreground">Applies automatically instead of requiring a promo code.</p>
          </div>
          <Switch checked={isAutoApplicable} onCheckedChange={setIsAutoApplicable} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor={maxUseId}>Max uses</Label>
            <Input
              id={maxUseId}
              type="number"
              min={0}
              value={maxNumberOfUse}
              onChange={(event) => setMaxNumberOfUse(event.target.value)}
              placeholder="Unlimited"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={maxDiscountId}>Max discount (₦)</Label>
            <Input
              id={maxDiscountId}
              type="number"
              min={0}
              value={maxDiscountedAmount}
              onChange={(event) => setMaxDiscountedAmount(event.target.value)}
              placeholder="No cap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={minOrderId}>Min order (₦)</Label>
            <Input
              id={minOrderId}
              type="number"
              min={0}
              value={minimumOrderAmount}
              onChange={(event) => setMinimumOrderAmount(event.target.value)}
              placeholder="None"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scope (leave all blank for platform-wide)</Label>
          <div className="grid grid-cols-3 gap-3">
            <Input
              id={merchantIdFieldId}
              value={merchantId}
              onChange={(event) => setMerchantId(event.target.value)}
              placeholder="Merchant ID"
            />
            <Input
              id={storeIdFieldId}
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              placeholder="Store ID"
            />
            <Input
              id={userIdFieldId}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User ID"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={descriptionId}>Description (optional)</Label>
          <Textarea id={descriptionId} value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create discount
        </Button>
      </DialogFooter>
    </>
  )
}

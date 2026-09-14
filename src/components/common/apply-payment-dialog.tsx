"use client"

import { useId, useState, useTransition } from "react"
import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { applyOrderPaymentAction } from "@/app/(admin)/payments/actions"
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

type ApplyPaymentDialogProps = {
  trigger: ReactNode
  /** Pass when opened from an order's own page — locks the order ID field. */
  orderId?: string
  onApplied?: () => void
}

/**
 * Shared by the standalone Payments tool and the Order detail page ("This
 * can be done via orders too" per the product spec) — same action, same
 * dialog, just with the order ID pre-filled and locked when opened from an
 * order's own page.
 */
export function ApplyPaymentDialog({ trigger, orderId, onApplied }: ApplyPaymentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply payment to order</DialogTitle>
          <DialogDescription>
            Verifies the reference against Paystack and applies it to the order&apos;s checkout. If a payment is
            already recorded for this order, this silently does nothing — check its payment status first.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ApplyPaymentForm
            fixedOrderId={orderId}
            onClose={() => setOpen(false)}
            onApplied={onApplied}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ApplyPaymentForm({
  fixedOrderId,
  onClose,
  onApplied,
}: {
  fixedOrderId?: string
  onClose: () => void
  onApplied?: () => void
}) {
  const [orderId, setOrderId] = useState(fixedOrderId ?? "")
  const [reference, setReference] = useState("")
  const [pending, startTransition] = useTransition()
  const orderIdId = useId()
  const referenceId = useId()

  function handleConfirm() {
    startTransition(async () => {
      const result = await applyOrderPaymentAction(orderId.trim(), reference.trim())
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Payment applied.")
      onClose()
      onApplied?.()
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={orderIdId}>Order ID</Label>
          <Input
            id={orderIdId}
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            disabled={Boolean(fixedOrderId)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={referenceId}>Payment reference</Label>
          <Input
            id={referenceId}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Paystack transaction reference"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={pending || !orderId.trim() || !reference.trim()}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Apply payment
        </Button>
      </DialogFooter>
    </>
  )
}

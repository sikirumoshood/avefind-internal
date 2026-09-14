"use client"

import { useId, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { OrderStatusReason } from "@/lib/types"

import { reviewOrderAction } from "../actions"

const REJECTION_REASONS: Array<{ value: OrderStatusReason; label: string }> = [
  { value: "COULD_NOT_FIND_EXACT_ITEM_IN_QUESTION", label: "Could not find the exact item" },
  { value: "PROLONGED_ORDER_QUOTATION_TIME", label: "Prolonged quotation time" },
  { value: "QUOTATION_TOO_EXPENSIVE", label: "Quotation too expensive" },
  { value: "INVALID_ORDER_DETAILS", label: "Invalid order details" },
  { value: "OTHER", label: "Other" },
]

type ReviewOrderDialogProps = {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

export function ReviewOrderDialog({ orderId, open, onOpenChange, onDone }: ReviewOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review pending order</DialogTitle>
          <DialogDescription>
            Approve to send it out for merchant quotes, or reject to stop it here with a reason for the customer.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ReviewOrderForm orderId={orderId} onClose={() => onOpenChange(false)} onDone={onDone} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ReviewOrderForm({ orderId, onClose, onDone }: { orderId: string; onClose: () => void; onDone: () => void }) {
  const [action, setAction] = useState<"Approve" | "Reject">("Approve")
  const [reason, setReason] = useState<OrderStatusReason | "">("")
  const [reasonDescription, setReasonDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const reasonDescriptionId = useId()

  function handleSubmit() {
    setError(null)
    if (action === "Reject" && !reason) {
      setError("Select a rejection reason.")
      return
    }

    startTransition(async () => {
      const result = await reviewOrderAction(
        orderId,
        action,
        action === "Reject" ? (reason as OrderStatusReason) : undefined,
        reasonDescription.trim() || undefined,
      )
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success(action === "Approve" ? "Order approved." : "Order rejected.")
      onClose()
      onDone()
    })
  }

  return (
    <>
      <div className="space-y-4">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label>Decision</Label>
          <Select value={action} onValueChange={(value) => setAction(value as "Approve" | "Reject")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Approve">Approve</SelectItem>
              <SelectItem value="Reject">Reject</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {action === "Reject" ? (
          <>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(value) => setReason(value as OrderStatusReason)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={reasonDescriptionId}>Details (optional)</Label>
              <Textarea
                id={reasonDescriptionId}
                value={reasonDescription}
                onChange={(event) => setReasonDescription(event.target.value)}
                rows={3}
              />
            </div>
          </>
        ) : null}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending} variant={action === "Reject" ? "destructive" : "default"}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {action === "Approve" ? "Approve order" : "Reject order"}
        </Button>
      </DialogFooter>
    </>
  )
}

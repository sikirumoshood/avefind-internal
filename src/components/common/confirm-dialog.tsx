"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /** Show a required free-text reason field (e.g. rejecting/deactivating). */
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  /** Return `false` (after showing your own error toast) to keep the dialog open; anything else closes it. */
  onConfirm: (reason?: string) => Promise<boolean | void> | boolean | void
}

/**
 * Controlled confirm dialog for row actions gated behind an approve/reject
 * or activate/deactivate style decision — reused across Merchants, Delivery
 * Agents, and anywhere else that needs "confirm, optionally with a reason."
 * Deliberately has no built-in trigger: the caller owns `open` state (e.g.
 * from a DropdownMenuItem's onSelect), which sidesteps the usual
 * Dialog-nested-inside-DropdownMenu focus/close conflicts.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  requireReason,
  reasonLabel = "Reason",
  reasonPlaceholder,
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("")
  const [pending, startTransition] = useTransition()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) setReason("")
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm(requireReason ? reason : undefined)
      if (result !== false) handleOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {requireReason ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-dialog-reason">{reasonLabel}</Label>
            <Textarea
              id="confirm-dialog-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={pending || (requireReason && !reason.trim())}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

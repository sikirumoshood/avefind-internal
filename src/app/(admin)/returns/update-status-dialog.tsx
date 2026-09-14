"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RETURN_CASE_STATUS_OPTIONS } from "@/lib/order-return-cases"
import type { AdminOrderReturnCase, OrderReturnCaseStatus } from "@/lib/types"

import { updateReturnCaseStatusAction } from "./actions"

export function UpdateStatusDialog({
  returnCase,
  onOpenChange,
}: {
  returnCase: AdminOrderReturnCase | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={returnCase !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update return case status</DialogTitle>
          <DialogDescription>Order {returnCase?.orderId}</DialogDescription>
        </DialogHeader>
        {returnCase ? (
          <UpdateStatusForm returnCase={returnCase} onClose={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function UpdateStatusForm({
  returnCase,
  onClose,
}: {
  returnCase: AdminOrderReturnCase
  onClose: () => void
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderReturnCaseStatus>(returnCase.status)
  const [notes, setNotes] = useState(returnCase.notes ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const notesField = useId()

  function handleSubmit() {
    setError(null)

    startTransition(async () => {
      const result = await updateReturnCaseStatusAction(returnCase.id, status, notes.trim() || undefined)

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Return case updated.")
      onClose()
      router.refresh()
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
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as OrderReturnCaseStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETURN_CASE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={notesField}>Notes (optional)</Label>
          <Textarea id={notesField} value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { AttachmentUpload } from "@/components/common/attachment-upload"
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
import { Textarea } from "@/components/ui/textarea"

import { createReturnCaseAction } from "./actions"

const MAX_RETURN_CASE_ATTACHMENTS = 5

export function CreateReturnCaseDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Log return case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log a return case</DialogTitle>
          <DialogDescription>
            Opens with OPEN status, assigned to you. Each order can only have one return case.
          </DialogDescription>
        </DialogHeader>
        {open ? <ReturnCaseForm onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ReturnCaseForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [orderId, setOrderId] = useState("")
  const [returnReason, setReturnReason] = useState("")
  const [notes, setNotes] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const orderIdField = useId()
  const reasonField = useId()
  const notesField = useId()

  function handleSubmit() {
    setError(null)

    if (!orderId.trim()) return setError("An order ID is required.")
    if (!returnReason.trim()) return setError("A return reason is required.")

    startTransition(async () => {
      const result = await createReturnCaseAction({
        orderId: orderId.trim(),
        returnReason: returnReason.trim(),
        notes: notes.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success("Return case logged.")
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
          <Label htmlFor={orderIdField}>Order ID</Label>
          <Input
            id={orderIdField}
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="ORD-…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={reasonField}>Return reason</Label>
          <Textarea
            id={reasonField}
            value={returnReason}
            onChange={(event) => setReturnReason(event.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={notesField}>Notes (optional)</Label>
          <Textarea id={notesField} value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
        </div>

        <div className="space-y-2">
          <Label>Attachments (optional)</Label>
          <AttachmentUpload value={attachments} onChange={setAttachments} maxFiles={MAX_RETURN_CASE_ATTACHMENTS} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Log case
        </Button>
      </DialogFooter>
    </>
  )
}

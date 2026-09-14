"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Gift, Loader2 } from "lucide-react"
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

import { applyCashbackAction } from "./actions"

export function ApplyCashbackDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Gift /> Apply cashback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply cashback</DialogTitle>
          <DialogDescription>Credits this user&apos;s reward balance immediately.</DialogDescription>
        </DialogHeader>
        {open ? <ApplyCashbackForm userId={userId} onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function ApplyCashbackForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [pending, startTransition] = useTransition()
  const amountId = useId()
  const descriptionId = useId()

  function handleConfirm() {
    const parsed = Number(amount)
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid cashback amount.")
      return
    }

    startTransition(async () => {
      const result = await applyCashbackAction(userId, parsed, description.trim() || undefined)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Cashback applied.")
      onClose()
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={amountId}>Amount (₦)</Label>
          <Input
            id={amountId}
            type="number"
            step="any"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={descriptionId}>Description (optional)</Label>
          <Input id={descriptionId} value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={pending || !amount}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Apply cashback
        </Button>
      </DialogFooter>
    </>
  )
}

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
import { rewardConfigurationTypeLabel } from "@/lib/rewards"
import type { RewardConfigurationType } from "@/lib/types"

import { createRewardConfigAction } from "./actions"

const TYPE_OPTIONS: RewardConfigurationType[] = ["CUSTOMER", "DELIVERY_AGENT", "MERCHANT"]

type RewardKind = "PERCENTAGE" | "AMOUNT"

export function RewardConfigFormDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create configuration
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create reward configuration</DialogTitle>
          <DialogDescription>
            This retires the current configuration for the selected type and makes this the new current one — there
            can only be one active configuration per type at a time.
          </DialogDescription>
        </DialogHeader>
        {open ? <RewardConfigForm onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function RewardConfigForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [type, setType] = useState<RewardConfigurationType>("CUSTOMER")
  const [rewardKind, setRewardKind] = useState<RewardKind>("PERCENTAGE")
  const [minOrderAmount, setMinOrderAmount] = useState("")
  const [maxRewardAmount, setMaxRewardAmount] = useState("")
  const [rewardValue, setRewardValue] = useState("")
  const [maxUsage, setMaxUsage] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formId = useId()

  function handleSubmit() {
    setError(null)

    const parsedMinOrderAmount = Number(minOrderAmount)
    const parsedMaxRewardAmount = Number(maxRewardAmount)
    const parsedRewardValue = Number(rewardValue)
    const parsedMaxUsage = Number(maxUsage)

    if (!minOrderAmount || Number.isNaN(parsedMinOrderAmount)) {
      setError("Minimum order amount must be a number.")
      return
    }
    if (!maxRewardAmount || Number.isNaN(parsedMaxRewardAmount)) {
      setError("Maximum reward amount must be a number.")
      return
    }
    if (!rewardValue || Number.isNaN(parsedRewardValue)) {
      setError(rewardKind === "PERCENTAGE" ? "Reward percentage must be a number." : "Reward amount must be a number.")
      return
    }
    if (!maxUsage || Number.isNaN(parsedMaxUsage)) {
      setError("Max usage must be a number.")
      return
    }
    if (!description.trim()) {
      setError("Description is required.")
      return
    }

    startTransition(async () => {
      const result = await createRewardConfigAction({
        type,
        minOrderAmount: parsedMinOrderAmount,
        maxRewardAmount: parsedMaxRewardAmount,
        maxUsage: parsedMaxUsage,
        description: description.trim(),
        ...(rewardKind === "PERCENTAGE"
          ? { rewardPercentage: parsedRewardValue }
          : { rewardAmount: parsedRewardValue }),
      })
      if (result.error) {
        setError(result.error)
        return
      }
      toast.success("Reward configuration created.")
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

        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-type`}>Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as RewardConfigurationType)}>
            <SelectTrigger id={`${formId}-type`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {rewardConfigurationTypeLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-minOrderAmount`}>Min order amount</Label>
            <Input
              id={`${formId}-minOrderAmount`}
              type="number"
              step="any"
              value={minOrderAmount}
              onChange={(event) => setMinOrderAmount(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-maxRewardAmount`}>Max reward amount</Label>
            <Input
              id={`${formId}-maxRewardAmount`}
              type="number"
              step="any"
              value={maxRewardAmount}
              onChange={(event) => setMaxRewardAmount(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-rewardKind`}>Reward type</Label>
            <Select value={rewardKind} onValueChange={(value) => setRewardKind(value as RewardKind)}>
              <SelectTrigger id={`${formId}-rewardKind`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="AMOUNT">Flat amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-rewardValue`}>{rewardKind === "PERCENTAGE" ? "Reward percentage" : "Reward amount"}</Label>
            <Input
              id={`${formId}-rewardValue`}
              type="number"
              step="any"
              value={rewardValue}
              onChange={(event) => setRewardValue(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-maxUsage`}>Max usage</Label>
            <Input
              id={`${formId}-maxUsage`}
              type="number"
              step="1"
              value={maxUsage}
              onChange={(event) => setMaxUsage(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-description`}>Description</Label>
          <Input
            id={`${formId}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Create
        </Button>
      </DialogFooter>
    </>
  )
}

"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { format } from "date-fns"
import { CheckCircle2, Star, Store as StoreIcon, XCircle } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { CopyButton } from "@/components/common/copy-button"
import { StatCard } from "@/components/common/stat-card"
import { StatusBadge } from "@/components/common/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { merchantStatus } from "@/lib/merchants"
import type { AdminMerchant } from "@/lib/types"
import { resolveImageUrl } from "@/lib/utils"

import {
  approveMerchantAction,
  rejectMerchantAction,
  setIncludeRewardInPayoutAction,
  setMerchantActiveStatusAction,
} from "./actions"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

type ActionState = "approve" | "reject" | "activate" | "deactivate"

export function SummaryTab({ merchant }: { merchant: AdminMerchant }) {
  const [action, setAction] = useState<ActionState | null>(null)
  const [includeReward, setIncludeReward] = useState(merchant.includeRewardInPayout ?? true)
  const [togglingReward, setTogglingReward] = useState(false)
  const status = merchantStatus(merchant)
  // Not just "never reviewed" — a merchant rejected earlier and reconsidered still needs
  // Approve/Reject available, not just Activate/Deactivate, until they're actually approved.
  const needsApprovalDecision = !merchant.applicationApprovedAt

  async function handleConfirm(reason?: string): Promise<boolean> {
    if (!action) return false

    const result =
      action === "approve"
        ? await approveMerchantAction(merchant.id)
        : action === "reject"
          ? await rejectMerchantAction(merchant.id, reason ?? "")
          : action === "activate"
            ? await setMerchantActiveStatusAction(merchant.id, true)
            : await setMerchantActiveStatusAction(merchant.id, false, reason)

    if (result.error) {
      toast.error(result.error)
      return false
    }

    const messages: Record<ActionState, string> = {
      approve: "Merchant approved.",
      reject: "Application rejected.",
      activate: "Merchant activated.",
      deactivate: "Merchant deactivated.",
    }
    toast.success(messages[action])
    return true
  }

  async function handleIncludeRewardToggle(next: boolean) {
    setIncludeReward(next)
    setTogglingReward(true)
    const result = await setIncludeRewardInPayoutAction(merchant.id, next)
    setTogglingReward(false)
    if (result.error) {
      setIncludeReward(!next)
      toast.error(result.error)
      return
    }
    toast.success(next ? "Reward included in payout." : "Reward excluded from payout.")
  }

  const dialogCopy: Record<ActionState, { title: string; description: string; confirmLabel: string }> = {
    approve: {
      title: "Approve merchant?",
      description: "They'll be notified and activated immediately.",
      confirmLabel: "Approve",
    },
    reject: {
      title: "Reject application?",
      description: "They'll be notified with the reason below.",
      confirmLabel: "Reject",
    },
    activate: {
      title: "Activate merchant?",
      description: "This restores their access to receive orders.",
      confirmLabel: "Activate",
    },
    deactivate: {
      title: "Deactivate merchant?",
      description: "They'll lose access to receive orders until reactivated.",
      confirmLabel: "Deactivate",
    },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Number of stores" value={merchant.stores.length} icon={StoreIcon} />
        <StatCard
          label="Rating score"
          value={merchant.ratingScore ? merchant.ratingScore.toFixed(1) : "—"}
          icon={Star}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={merchant.logoUrl ? resolveImageUrl(merchant.logoUrl) : undefined} alt="" />
              <AvatarFallback>{initials(merchant.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">{merchant.name}</p>
              <StatusBadge label={status.label} tone={status.tone} className="mt-1" />
            </div>
          </div>

          <div className="flex gap-2">
            {needsApprovalDecision ? (
              <>
                <Button variant="outline" onClick={() => setAction("reject")}>
                  <XCircle /> Reject
                </Button>
                <Button onClick={() => setAction("approve")}>
                  <CheckCircle2 /> Approve
                </Button>
              </>
            ) : (
              <Button
                variant={merchant.isActive ? "destructive" : "default"}
                onClick={() => setAction(merchant.isActive ? "deactivate" : "activate")}
              >
                {merchant.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y pt-6">
          <Field
            label="Business name"
            value={
              <span className="flex items-center gap-1">
                {merchant.name}
                <CopyButton value={merchant.id} />
              </span>
            }
          />
          <Field label="Business number" value={merchant.businessNumber ?? "—"} />
          <Field
            label="Account holder"
            value={
              <span className="flex items-center gap-1">
                {merchant.createdByUser.firstName} {merchant.createdByUser.lastName}
                <CopyButton value={merchant.createdByUser.email} />
              </span>
            }
          />
          <Field
            label="Business categories"
            value={
              merchant.categories.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-1">
                  {merchant.categories.map((category) => (
                    <StatusBadge key={category} label={category} tone="neutral" />
                  ))}
                </div>
              ) : (
                "—"
              )
            }
          />
          <Field
            label="Contact number"
            value={
              <span className="flex items-center gap-1">
                {merchant.contactNumber}
                <CopyButton value={merchant.contactNumber} />
              </span>
            }
          />
          <Field
            label="Contact email"
            value={
              <span className="flex items-center gap-1">
                {merchant.contactEmail}
                <CopyButton value={merchant.contactEmail} />
              </span>
            }
          />
          <Field label="Created on" value={format(new Date(merchant.createdAt), "PPp")} />
          <Field label="Account status" value={merchant.isActive ? "Active" : "Inactive"} />
          <Field
            label="Application status"
            value={
              // Checked in this order (not needsApprovalDecision) so a rejected-then-reconsidered
              // merchant still reads as "Rejected" until they're actually re-approved, rather than
              // reverting to "Pending review".
              merchant.applicationRejectedAt ? (
                <StatusBadge label="Rejected" tone="destructive" />
              ) : merchant.applicationApprovedAt ? (
                <StatusBadge label="Approved" tone="success" />
              ) : (
                <StatusBadge label="Pending review" tone="warning" />
              )
            }
          />
          {merchant.applicationRejectedReason ? (
            <Field label="Application rejection reason" value={merchant.applicationRejectedReason} />
          ) : null}
          <Field
            label="Include reward in payout"
            value={<Switch checked={includeReward} onCheckedChange={handleIncludeRewardToggle} disabled={togglingReward} />}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={action ? dialogCopy[action].title : ""}
        description={action ? dialogCopy[action].description : undefined}
        confirmLabel={action ? dialogCopy[action].confirmLabel : undefined}
        destructive={action === "reject" || action === "deactivate"}
        requireReason={action === "reject" || action === "deactivate"}
        reasonLabel={action === "reject" ? "Rejection reason" : "Deactivation reason"}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { format } from "date-fns"
import { Bike, Circle } from "lucide-react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { CopyButton } from "@/components/common/copy-button"
import { StatCard } from "@/components/common/stat-card"
import { StatusBadge } from "@/components/common/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { applicationStatusBadge } from "@/lib/delivery-agents"
import type { AdminDeliveryAgent } from "@/lib/types"
import { resolveImageUrl } from "@/lib/utils"

import { setActiveStatusAction } from "./actions"

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export function SummaryTab({ agent }: { agent: AdminDeliveryAgent }) {
  const [action, setAction] = useState<"activate" | "deactivate" | null>(null)
  const status = applicationStatusBadge(agent.applicationStatus, agent.isActive)

  async function handleConfirm(reason?: string): Promise<boolean> {
    if (!action) return false
    const result = await setActiveStatusAction(agent.id, action === "activate", reason)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success(action === "activate" ? "Agent activated." : "Agent deactivated.")
    return true
  }

  return (
    <div className="space-y-6">
      <StatCard label="Ongoing delivery count" value={agent.totalOrdersUnderDelivery} icon={Bike} />

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={agent.user.profileUrl ? resolveImageUrl(agent.user.profileUrl) : undefined} alt="" />
              <AvatarFallback>{initials(agent.user.firstName, agent.user.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-medium">
                {agent.user.firstName} {agent.user.lastName}
              </p>
              <StatusBadge label={status.label} tone={status.tone} className="mt-1" />
            </div>
          </div>

          <Button
            variant={agent.isActive ? "destructive" : "default"}
            disabled={agent.applicationStatus !== "APPROVED"}
            onClick={() => setAction(agent.isActive ? "deactivate" : "activate")}
          >
            {agent.isActive ? "Deactivate" : "Activate"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y pt-6">
          <Field
            label="Phone number"
            value={
              <span className="flex items-center gap-1">
                {agent.user.phoneNumber}
                <CopyButton value={agent.user.phoneNumber} />
              </span>
            }
          />
          <Field
            label="Email"
            value={
              <span className="flex items-center gap-1">
                {agent.user.email}
                <CopyButton value={agent.user.email} />
              </span>
            }
          />
          <Field label="Application status" value={<StatusBadge label={status.label} tone={status.tone} />} />
          <Field label="Delivery medium" value={<span className="capitalize">{agent.deliveryMedium.toLowerCase()}</span>} />
          <Field label="Work type" value={<span className="capitalize">{agent.workType.toLowerCase().replace("_", " ")}</span>} />
          <Field
            label="Online status"
            value={
              <span className="flex items-center gap-1.5">
                <Circle
                  className={
                    agent.isOnline
                      ? "size-2.5 fill-success text-success"
                      : "size-2.5 fill-muted-foreground/40 text-muted-foreground/40"
                  }
                />
                {agent.isOnline ? "Online" : "Offline"}
              </span>
            }
          />
          <Field label="Account status" value={agent.isActive ? "Active" : "Inactive"} />
          <Field
            label="Deactivation date"
            value={agent.deactivationDate ? format(new Date(agent.deactivationDate), "PPp") : "—"}
          />
          <Field
            label="Office clearance date"
            value={agent.officeClearanceDate ? format(new Date(agent.officeClearanceDate), "PPp") : "—"}
          />
          <Field label="Created on" value={format(new Date(agent.createdAt), "PPp")} />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={action === "activate" ? "Activate delivery agent?" : "Deactivate delivery agent?"}
        description={
          action === "activate"
            ? "This restores their access to receive delivery requests."
            : "They'll lose access to receive delivery requests until reactivated."
        }
        confirmLabel={action === "activate" ? "Activate" : "Deactivate"}
        destructive={action === "deactivate"}
        requireReason={action === "deactivate"}
        reasonLabel="Deactivation reason"
        onConfirm={handleConfirm}
      />
    </div>
  )
}

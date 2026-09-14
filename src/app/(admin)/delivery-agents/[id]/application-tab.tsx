"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { AttachmentGallery } from "@/components/common/attachment-gallery"
import { StatusBadge } from "@/components/common/status-badge"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Timeline, type TimelineItem } from "@/components/common/timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { applicationStatusBadge } from "@/lib/delivery-agents"
import type { AdminDeliveryAgent, DeliveryAgentDecryptedData } from "@/lib/types"

import { updateApplicationStatusAction } from "./actions"

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

function PhotoBox({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {url ? (
        <AttachmentGallery keys={[url]} size="md" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
          No photo
        </div>
      )}
    </div>
  )
}

type ApplicationAction = "office_visit" | "approve" | "reject"

export function ApplicationTab({
  agent,
  decryptedData,
}: {
  agent: AdminDeliveryAgent
  decryptedData: DeliveryAgentDecryptedData | null
}) {
  const [action, setAction] = useState<ApplicationAction | null>(null)
  const status = applicationStatusBadge(agent.applicationStatus, agent.isActive)

  const timelineItems: TimelineItem[] = [...agent.applicationStatusHistory]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry) => ({
      id: entry.id,
      title: applicationStatusBadge(entry.status, agent.isActive).label,
      timestamp: entry.createdAt,
      description: entry.reason,
      tone: applicationStatusBadge(entry.status, agent.isActive).tone,
    }))

  async function handleConfirm(reason?: string): Promise<boolean> {
    if (!action) return false
    const nextStatus = action === "office_visit" ? "PENDING_OFFICE_VISIT" : action === "approve" ? "APPROVED" : "REJECTED"
    const result = await updateApplicationStatusAction(agent.id, nextStatus, reason)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Application status updated.")
    return true
  }

  const dialogCopy: Record<ApplicationAction, { title: string; description: string; confirmLabel: string }> = {
    office_visit: {
      title: "Request an office visit?",
      description: "The agent will be notified to complete an in-person visit before approval.",
      confirmLabel: "Request visit",
    },
    approve: {
      title: "Approve delivery agent?",
      description: "They'll be notified and activated immediately.",
      confirmLabel: "Approve",
    },
    reject: {
      title: "Reject application?",
      description: "They'll be notified with the reason below.",
      confirmLabel: "Reject",
    },
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Application details</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={agent.applicationStatus !== "IN_REVIEW"}
                onClick={() => setAction("office_visit")}
              >
                Request office visit
              </Button>
              <Button
                size="sm"
                disabled={agent.applicationStatus !== "IN_REVIEW" && agent.applicationStatus !== "PENDING_OFFICE_VISIT"}
                onClick={() => setAction("approve")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={agent.applicationStatus !== "IN_REVIEW" && agent.applicationStatus !== "PENDING_OFFICE_VISIT"}
                onClick={() => setAction("reject")}
              >
                Reject
              </Button>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            <Field label="Delivery medium" value={<span className="capitalize">{agent.deliveryMedium.toLowerCase()}</span>} />
            <Field label="Work type" value={<span className="capitalize">{agent.workType.toLowerCase().replace("_", " ")}</span>} />
            <Field label="Application status" value={<StatusBadge label={status.label} tone={status.tone} />} />
            <Field label="ID document type" value={agent.idType ?? "—"} />
            <Field label="ID document number" value={decryptedData?.idNumber ?? "—"} />
            <Field label="Vehicle plate number" value={agent.vehiclePlateNumber ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={timelineItems} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhotoBox label="ID document photo" url={decryptedData?.idPhotoUrl ?? null} />
        <PhotoBox label="Vehicle photo" url={agent.vehiclePhotoUrl} />
      </div>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={action ? dialogCopy[action].title : ""}
        description={action ? dialogCopy[action].description : undefined}
        confirmLabel={action ? dialogCopy[action].confirmLabel : undefined}
        destructive={action === "reject"}
        requireReason={action === "reject"}
        reasonLabel="Rejection reason"
        onConfirm={handleConfirm}
      />
    </div>
  )
}

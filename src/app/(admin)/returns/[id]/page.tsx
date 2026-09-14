import { format } from "date-fns"
import { Undo2 } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { AttachmentGallery } from "@/components/common/attachment-gallery"
import { CopyButton } from "@/components/common/copy-button"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api"
import { getReturnCase } from "@/lib/api/order-return-cases"
import { RETURN_CASE_STATUS_TONE } from "@/lib/order-return-cases"
import { orderStatusLabel, orderStatusTone } from "@/lib/orders"
import { formatCurrency } from "@/lib/utils"

import { ReturnCaseDetailActions } from "./return-case-detail-actions"

export async function generateMetadata(props: PageProps<"/returns/[id]">): Promise<Metadata> {
  const { id } = await props.params
  return { title: `Return case ${id}` }
}

export default async function ReturnCaseDetailPage(props: PageProps<"/returns/[id]">) {
  const { id } = await props.params

  let returnCase: Awaited<ReturnType<typeof getReturnCase>> | null = null
  let loadError: string | null = null

  try {
    returnCase = await getReturnCase(id)
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load return case."
  }

  if (loadError || !returnCase) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Return case ${id}`} />
        <EmptyState icon={Undo2} title="Couldn't load return case" description={loadError ?? undefined} />
      </div>
    )
  }

  const amount = returnCase.order.checkout
    ? (returnCase.order.checkout.discountedTotalAmount ?? returnCase.order.checkout.totalAmount)
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-1.5">
            Return case {returnCase.id}
            <CopyButton value={returnCase.id} />
          </span>
        }
        description={format(new Date(returnCase.createdAt), "PPpp")}
        actions={<ReturnCaseDetailActions returnCase={returnCase} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order</span>
              <Link href={`/orders/${returnCase.order.id}`} className="font-medium hover:underline">
                {returnCase.order.id}
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order status</span>
              <StatusBadge label={orderStatusLabel(returnCase.order.status)} tone={orderStatusTone(returnCase.order.status)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{returnCase.order.category}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Item</span>
              <span className="text-right">{returnCase.order.item}</span>
            </div>
            {amount !== null ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatCurrency(amount)}</span>
              </div>
            ) : null}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span>
                {returnCase.order.user.firstName} {returnCase.order.user.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{returnCase.order.user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{returnCase.order.user.phoneNumber}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge label={returnCase.status} tone={RETURN_CASE_STATUS_TONE[returnCase.status]} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Assignee</span>
              <span>
                {returnCase.assignee.firstName} {returnCase.assignee.lastName}
              </span>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-muted-foreground">Return reason</span>
              <p className="whitespace-pre-wrap">{returnCase.returnReason}</p>
            </div>
            {returnCase.notes ? (
              <div className="space-y-1">
                <span className="text-muted-foreground">Notes</span>
                <p className="whitespace-pre-wrap">{returnCase.notes}</p>
              </div>
            ) : null}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Logged</span>
              <span>{format(new Date(returnCase.createdAt), "PPp")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>{format(new Date(returnCase.updatedAt), "PPp")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {returnCase.attachments.length > 0 ? (
            <AttachmentGallery keys={returnCase.attachments} />
          ) : (
            <p className="text-sm text-muted-foreground">No attachments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

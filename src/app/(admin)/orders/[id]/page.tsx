import { format } from "date-fns"
import { ShoppingCart } from "lucide-react"
import type { Metadata } from "next"

import { AttachmentGallery } from "@/components/common/attachment-gallery"
import { CopyButton } from "@/components/common/copy-button"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { Timeline, type TimelineItem } from "@/components/common/timeline"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api"
import { getDeliveryAgent } from "@/lib/api/delivery-agents"
import { getOrderDeliveryAgent, getOrderInfo } from "@/lib/api/orders"
import { confirmedMerchantOrderRequest, deliveryRequestStatusLabel, deliveryRequestStatusTone, orderStatusLabel, orderStatusTone } from "@/lib/orders"
import { koboToNaira } from "@/lib/rewards"
import { formatCurrency } from "@/lib/utils"

import { CustomerTab } from "./customer-tab"
import { DeliveryTab } from "./delivery-tab"
import { MerchantRequestsList } from "./merchant-requests-list"
import { OrderActions } from "./order-actions"

/** FailedRewardsAccrualReason values are PascalCase (e.g. "ExhaustedRewardUsage") — space them out for display. */
function humanizeFailedAccrualReason(reason: string): string {
  return reason.replace(/([a-z])([A-Z])/g, "$1 $2")
}

export async function generateMetadata(props: PageProps<"/orders/[id]">): Promise<Metadata> {
  const { id } = await props.params
  return { title: `Order ${id}` }
}

export default async function OrderDetailPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params

  let orderResult: Awaited<ReturnType<typeof getOrderInfo>> | null = null
  let loadError: string | null = null

  try {
    orderResult = await getOrderInfo(id)
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load order."
  }

  if (loadError || !orderResult) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Order ${id}`} />
        <EmptyState icon={ShoppingCart} title="Couldn't load order" description={loadError ?? undefined} />
      </div>
    )
  }

  const order = orderResult.order
  const confirmed = confirmedMerchantOrderRequest(order.merchantOrderRequests)
  const deliveryAgent = await getOrderDeliveryAgent(id)
    .then((result) => result.deliveryAgent)
    .catch(() => undefined)
  const riderOngoingDeliveries = deliveryAgent
    ? await getDeliveryAgent(deliveryAgent.id)
        .then((agent) => agent.totalOrdersUnderDelivery)
        .catch(() => undefined)
    : undefined

  const timelineItems: TimelineItem[] = [...order.timeline]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((entry) => ({
      id: entry.id,
      title: orderStatusLabel(entry.status),
      timestamp: entry.createdAt,
      description: entry.reason,
      tone: orderStatusTone(entry.status),
    }))

  const deliveryRequestItems: TimelineItem[] = [...order.deliveryRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((request) => ({
      id: request.id,
      title: `${request.deliveryAgent.user.firstName} ${request.deliveryAgent.user.lastName} — ${deliveryRequestStatusLabel(request.status)}`,
      timestamp: request.createdAt,
      description: request.statusReason,
      tone: deliveryRequestStatusTone(request.status),
    }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-1.5">
            Order {order.id}
            <CopyButton value={order.id} />
          </span>
        }
        description={format(new Date(order.createdAt), "PPpp")}
        actions={<OrderActions orderId={order.id} currentStatus={order.status} />}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Order details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge label={orderStatusLabel(order.status)} tone={orderStatusTone(order.status)} />
                </div>
                {order.reasonDescription ? (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Reason</span>
                    <span className="text-right">{order.reasonDescription}</span>
                  </div>
                ) : null}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{order.category}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Item</span>
                  <span className="text-right">{order.item}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground">Request</span>
                  <span className="max-w-xs text-right whitespace-pre-wrap">{order.request}</span>
                </div>
                {order.quantity ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{order.quantity}</span>
                  </div>
                ) : null}
                {order.checkout ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatCurrency(order.checkout.totalAmount)}</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confirmed store</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {confirmed?.store ? (
                  <>
                    <p className="font-medium">{confirmed.store.name}</p>
                    <p className="text-muted-foreground">
                      {[confirmed.store.addressLine1, confirmed.store.addressCity, confirmed.store.addressState]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p>{confirmed.store.contactNumber ?? "No contact number"}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No merchant has confirmed this order yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {order.attachments.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order photos</CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentGallery keys={order.attachments} />
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order status history</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline items={timelineItems} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order requests history</CardTitle>
              </CardHeader>
              <CardContent>
                <MerchantRequestsList requests={order.merchantOrderRequests} customer={order.user} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reward accrual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.rewardAccruals.length > 0 ? (
                order.rewardAccruals.map((accrual) => (
                  <div key={accrual.id} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {accrual.beneficiaryUser.firstName} {accrual.beneficiaryUser.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{accrual.beneficiaryUser.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(koboToNaira(accrual.amountRewarded))}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(accrual.createdAt), "PP")}</p>
                    </div>
                  </div>
                ))
              ) : order.failedRewardsAccrualReason ? (
                <p className="text-muted-foreground">
                  Not accrued — {humanizeFailedAccrualReason(order.failedRewardsAccrualReason)}
                </p>
              ) : (
                <p className="text-muted-foreground">Not yet accrued.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <DeliveryTab
            orderId={order.id}
            deliveryAgent={deliveryAgent}
            store={confirmed?.store ?? null}
            deliveryAddress={order.deliveryAddress}
            customer={order.user}
            timelineItems={timelineItems}
            deliveryRequestItems={deliveryRequestItems}
            riderOngoingDeliveries={riderOngoingDeliveries}
          />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerTab customer={order.user} isActive={order.user.isActive ?? true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

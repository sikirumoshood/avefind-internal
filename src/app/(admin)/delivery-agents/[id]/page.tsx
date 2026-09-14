import { Bike } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { CopyButton } from "@/components/common/copy-button"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError } from "@/lib/api"
import { getDeliveryAgent, getDeliveryAgentDecryptedData } from "@/lib/api/delivery-agents"
import { listPayouts } from "@/lib/api/payments"
import { resolveImageUrl } from "@/lib/utils"

import { ApplicationTab } from "./application-tab"
import { BankTab } from "./bank-tab"
import { PayoutTab } from "./payout-tab"
import { SummaryTab } from "./summary-tab"

export async function generateMetadata(props: PageProps<"/delivery-agents/[id]">): Promise<Metadata> {
  const { id } = await props.params
  return { title: `Delivery Agent ${id}` }
}

const PAGE_SIZE = 20

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parsePage(value: string | string[] | undefined) {
  const parsed = Number(first(value))
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export default async function DeliveryAgentDetailPage(props: PageProps<"/delivery-agents/[id]">) {
  const { id } = await props.params
  const searchParams = await props.searchParams

  const tabParam = first(searchParams.tab)
  const tab = tabParam === "application" || tabParam === "bank" || tabParam === "payout" ? tabParam : "summary"
  const page = parsePage(searchParams.page)

  let loadError: string | null = null
  let agent: Awaited<ReturnType<typeof getDeliveryAgent>> | null = null
  let decryptedData: Awaited<ReturnType<typeof getDeliveryAgentDecryptedData>> | null = null
  let payoutsResult: Awaited<ReturnType<typeof listPayouts>> | null = null

  try {
    agent = await getDeliveryAgent(id)
    if (tab === "application") {
      decryptedData = await getDeliveryAgentDecryptedData(id).catch(() => null)
    }
    if (tab === "payout") {
      payoutsResult = await listPayouts({ deliveryAgentIds: [id], page, limit: PAGE_SIZE })
    }
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load delivery agent."
  }

  if (loadError || !agent) {
    return (
      <div className="space-y-6">
        <PageHeader title="Delivery Agent" />
        <EmptyState icon={Bike} title="Couldn't load delivery agent" description={loadError ?? undefined} />
      </div>
    )
  }

  const emptyPagination = { currentPage: 1, limit: PAGE_SIZE, totalNumberOfPages: 1, totalNumberOfRecords: 0 }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={agent.user.profileUrl ? resolveImageUrl(agent.user.profileUrl) : undefined} alt="" />
              <AvatarFallback>
                {agent.user.firstName.at(0)}
                {agent.user.lastName.at(0)}
              </AvatarFallback>
            </Avatar>
            {agent.user.firstName} {agent.user.lastName}
            <CopyButton value={agent.id} />
          </span>
        }
        description={agent.id}
      />

      <Tabs value={tab}>
        <TabsList>
          <TabsTrigger value="summary" asChild>
            <Link href="?tab=summary">Summary</Link>
          </TabsTrigger>
          <TabsTrigger value="application" asChild>
            <Link href="?tab=application">Application</Link>
          </TabsTrigger>
          <TabsTrigger value="bank" asChild>
            <Link href="?tab=bank">Bank Information</Link>
          </TabsTrigger>
          <TabsTrigger value="payout" asChild>
            <Link href="?tab=payout">Payout</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <SummaryTab agent={agent} />
        </TabsContent>

        <TabsContent value="application">
          <ApplicationTab agent={agent} decryptedData={decryptedData} />
        </TabsContent>

        <TabsContent value="bank">
          <BankTab deliveryAgentId={agent.id} paymentMethods={agent.paymentMethods} />
        </TabsContent>

        <TabsContent value="payout">
          <PayoutTab
            deliveryAgentId={agent.id}
            payouts={payoutsResult?.data ?? []}
            pagination={payoutsResult?.pagination ?? emptyPagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Gift } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { listReferrals, listRewardConfigs } from "@/lib/api/rewards"
import { parseLimit, parsePage } from "@/lib/pagination"
import { rewardConfigurationTypeLabel } from "@/lib/rewards"
import { getSessionUser } from "@/lib/session"
import type { RewardConfigurationType } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

import { ReferralsSection } from "./referrals-section"
import { RewardConfigFormDialog } from "./reward-config-form-dialog"
import { RewardConfigsTable } from "./reward-configs-table"

export const metadata: Metadata = { title: "Rewards" }

const CONFIG_TYPES: RewardConfigurationType[] = ["CUSTOMER", "DELIVERY_AGENT", "MERCHANT"]

export default async function RewardsPage(props: PageProps<"/rewards">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit, 50)

  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false

  let configsResult: Awaited<ReturnType<typeof listRewardConfigs>> | null = null
  let loadError: string | null = null

  try {
    configsResult = await listRewardConfigs({ page, limit })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load reward configurations."
  }

  const configs = configsResult?.data ?? []

  const referralUserId = typeof searchParams.referralUserId === "string" ? searchParams.referralUserId : ""
  let referrals: Awaited<ReturnType<typeof listReferrals>> = []
  let referralsLoadError: string | null = null

  if (referralUserId) {
    try {
      referrals = await listReferrals(referralUserId)
    } catch (error) {
      referralsLoadError = error instanceof ApiError ? error.message : "Failed to load referrals."
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rewards"
        description="Manage reward configurations that drive automatic accrual."
        actions={canManage ? <RewardConfigFormDialog /> : undefined}
      />

      {loadError ? (
        <EmptyState icon={Gift} title="Couldn't load reward configurations" description={loadError} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONFIG_TYPES.map((type) => {
              const current = configs.find((config) => config.type === type && config.isCurrent && !config.deactivationOn)
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="text-base">{rewardConfigurationTypeLabel(type)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {current ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Reward</span>
                          <span className="font-medium">
                            {current.rewardPercentage !== null
                              ? `${current.rewardPercentage}%`
                              : formatCurrency(current.rewardAmount ?? 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Min order</span>
                          <span>{formatCurrency(current.minOrderAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Max reward</span>
                          <span>{formatCurrency(current.maxRewardAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Max usage</span>
                          <span>{current.maxUsage}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Not configured yet.</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <RewardConfigsTable
            configs={configs}
            pagination={
              configsResult?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }
            }
          />

          <ReferralsSection userId={referralUserId} referrals={referrals} loadError={referralsLoadError} />
        </>
      )}
    </div>
  )
}

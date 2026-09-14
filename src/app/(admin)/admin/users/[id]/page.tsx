import { format } from "date-fns"
import { Gift, ShieldAlert } from "lucide-react"
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { CopyButton } from "@/components/common/copy-button"
import { EmptyState } from "@/components/common/empty-state"
import { StatCard } from "@/components/common/stat-card"
import { StatusBadge } from "@/components/common/status-badge"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { getRewardHistory } from "@/lib/api/rewards"
import { getUser } from "@/lib/api/users"
import { parseLimit, parsePage } from "@/lib/pagination"
import { koboToNaira } from "@/lib/rewards"
import { roleLabel } from "@/lib/roles"
import { formatCurrency } from "@/lib/utils"

import { ApplyCashbackDialog } from "./apply-cashback-dialog"
import { RewardHistoryTable } from "./reward-history-table"
import { UserStatusAction } from "./user-status-action"

export async function generateMetadata(props: PageProps<"/admin/users/[id]">): Promise<Metadata> {
  const { id } = await props.params
  return { title: `User ${id}` }
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default async function UserDetailPage(props: PageProps<"/admin/users/[id]">) {
  const { id } = await props.params
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)

  let loadError: string | null = null
  let user: Awaited<ReturnType<typeof getUser>> | null = null
  let historyResult: Awaited<ReturnType<typeof getRewardHistory>> | null = null

  try {
    user = await getUser(id)
    historyResult = await getRewardHistory({ userId: id, page, limit })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load user."
  }

  if (loadError || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title="User" />
        <EmptyState icon={ShieldAlert} title="Couldn't load user" description={loadError ?? undefined} />
      </div>
    )
  }

  const emptyPagination = { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }
  const balance = historyResult?.data[0]?.currentBalance ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-1.5">
            {user.firstName} {user.lastName}
            <CopyButton value={user.id} />
          </span>
        }
        description={user.id}
        actions={<UserStatusAction userId={user.id} isActive={user.isActive} />}
      />

      <StatCard label="Reward balance" value={formatCurrency(koboToNaira(balance))} icon={Gift} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <Field
              label="Email"
              value={
                <span className="flex items-center gap-1">
                  {user.email}
                  <CopyButton value={user.email} />
                </span>
              }
            />
            <Field
              label="Phone number"
              value={
                <span className="flex items-center gap-1">
                  {user.phoneNumber}
                  <CopyButton value={user.phoneNumber} />
                </span>
              }
            />
            <Field label="Role" value={user.role.map(roleLabel).join(", ")} />
            <Field
              label="Account status"
              value={<StatusBadge label={user.isActive ? "Active" : "Inactive"} tone={user.isActive ? "success" : "neutral"} />}
            />
            <Field
              label="Deactivation date"
              value={user.deactivationDate ? format(new Date(user.deactivationDate), "PPp") : "—"}
            />
            <Field label="Created on" value={format(new Date(user.createdAt), "PPp")} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Reward history</CardTitle>
          <ApplyCashbackDialog userId={user.id} />
        </CardHeader>
        <CardContent>
          <RewardHistoryTable
            userId={user.id}
            entries={historyResult?.data ?? []}
            pagination={historyResult?.pagination ?? emptyPagination}
          />
        </CardContent>
      </Card>
    </div>
  )
}

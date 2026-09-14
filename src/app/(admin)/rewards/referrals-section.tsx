"use client"

import { useEffect, useMemo, useState } from "react"
import { Ban } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { koboToNaira, rewardConfigurationTypeLabel } from "@/lib/rewards"
import type { AdminReferralRewardConfiguration } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

import { deactivateReferralRewardConfigAction } from "./actions"

export function ReferralsSection({
  userId,
  referrals,
  loadError,
}: {
  userId: string
  referrals: AdminReferralRewardConfiguration[]
  loadError: string | null
}) {
  const { updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(userId)
  const [deactivateTarget, setDeactivateTarget] = useState<AdminReferralRewardConfiguration | null>(null)

  useEffect(() => {
    if (searchInput === userId) return
    const timeout = setTimeout(() => updateParams({ referralUserId: searchInput || undefined }, false), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  async function handleDeactivateConfirm(): Promise<boolean> {
    if (!deactivateTarget) return false
    const result = await deactivateReferralRewardConfigAction(deactivateTarget.referredUserId)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success("Referral deactivated.")
    return true
  }

  const columns = useMemo<ColumnDef<AdminReferralRewardConfiguration>[]>(
    () => [
      {
        id: "referredUser",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Referred user" />,
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.referredUser.firstName} {row.original.referredUser.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{row.original.referredUser.email}</div>
          </div>
        ),
      },
      {
        id: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Config type" />,
        cell: ({ row }) => rewardConfigurationTypeLabel(row.original.rewardConfiguration.type),
      },
      {
        id: "usage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
        cell: ({ row }) => `${row.original.accruedUsageCount} / ${row.original.rewardConfiguration.maxUsage}`,
      },
      {
        id: "accrued",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Accrued" />,
        cell: ({ row }) => formatCurrency(koboToNaira(row.original.amountAccruedInLowestDenomination)),
      },
      {
        id: "potential",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Potential max" />,
        cell: ({ row }) => formatCurrency(row.original.potentialMaxAmount),
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) =>
          row.original.deactivationOn ? (
            <StatusBadge label="Deactivated" tone="destructive" />
          ) : (
            <StatusBadge label="Active" tone="success" />
          ),
      },
      {
        id: "actions",
        cell: ({ row }) =>
          row.original.deactivationOn === null ? (
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setDeactivateTarget(row.original)}>
              <Ban className="size-4" />
            </Button>
          ) : null,
      },
    ],
    [],
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>
            Look up every referral a specific customer, delivery agent, or merchant has made, and turn off accrual
            for one referral without affecting the shared reward configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Enter a user ID…"
            className="sm:max-w-sm"
          />

          {!userId ? (
            <EmptyState title="Enter a user ID" description="Search for a user to see the referrals they've made." />
          ) : loadError ? (
            <EmptyState title="Couldn't load referrals" description={loadError} />
          ) : (
            <DataTable
              columns={columns}
              data={referrals}
              emptyState={
                <EmptyState title="No referrals found" description="This user hasn't referred anyone yet." />
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate this referral?"
        description="This stops reward accrual for this specific referral going forward — it does not affect the shared reward configuration or any other referral. This cannot be undone."
        confirmLabel="Deactivate"
        destructive
        onConfirm={handleDeactivateConfirm}
      />
    </>
  )
}

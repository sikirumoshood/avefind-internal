"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle2, MoreHorizontal, Star, XCircle } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { FilterMultiSelect } from "@/components/data-table/filter-multi-select"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { StatusBadge } from "@/components/common/status-badge"
import { merchantStatus } from "@/lib/merchants"
import type { AdminMerchant, MerchantListMeta } from "@/lib/types"
import { resolveImageUrl } from "@/lib/utils"

import { approveMerchantAction, rejectMerchantAction, setMerchantActiveStatusAction } from "./actions"

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
]

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

type ActionState =
  | { type: "approve"; merchant: AdminMerchant }
  | { type: "reject"; merchant: AdminMerchant }
  | { type: "activate"; merchant: AdminMerchant }
  | { type: "deactivate"; merchant: AdminMerchant }

type MerchantsTableProps = {
  merchants: AdminMerchant[]
  meta: MerchantListMeta
  filters: { statuses: string[]; search: string }
  /** Only ADMIN/MANAGER may approve/reject/activate/deactivate — apps/auth enforces this server-side too. */
  canManage: boolean
}

export function MerchantsTable({ merchants, meta, filters, canManage }: MerchantsTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [action, setAction] = useState<ActionState | null>(null)

  useEffect(() => {
    if (searchInput === filters.search) return
    const timeout = setTimeout(() => updateParams({ q: searchInput }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  async function handleConfirmAction(reason?: string): Promise<boolean> {
    if (!action) return false
    const { type, merchant } = action

    const result =
      type === "approve"
        ? await approveMerchantAction(merchant.id)
        : type === "reject"
          ? await rejectMerchantAction(merchant.id, reason ?? "")
          : type === "activate"
            ? await setMerchantActiveStatusAction(merchant.id, true)
            : await setMerchantActiveStatusAction(merchant.id, false, reason)

    if (result.error) {
      toast.error(result.error)
      return false
    }

    const messages: Record<ActionState["type"], string> = {
      approve: `${merchant.name} approved.`,
      reject: `${merchant.name}'s application rejected.`,
      activate: `${merchant.name} activated.`,
      deactivate: `${merchant.name} deactivated.`,
    }
    toast.success(messages[type])
    return true
  }

  const columns = useMemo<ColumnDef<AdminMerchant>[]>(() => {
    const base: ColumnDef<AdminMerchant>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Merchant" />,
        cell: ({ row }) => {
          const merchant = row.original
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarImage src={merchant.logoUrl ? resolveImageUrl(merchant.logoUrl) : undefined} alt="" />
                <AvatarFallback className="text-xs">{initials(merchant.name)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="font-medium">{merchant.name}</div>
                <div className="text-xs text-muted-foreground">{merchant.contactEmail}</div>
              </div>
            </div>
          )
        },
      },
      {
        id: "owner",
        accessorFn: (merchant) => `${merchant.createdByUser.firstName} ${merchant.createdByUser.lastName}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
        cell: ({ row }) => (
          <div className="leading-tight">
            <div>
              {row.original.createdByUser.firstName} {row.original.createdByUser.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{row.original.createdByUser.phoneNumber}</div>
          </div>
        ),
      },
      {
        id: "stores",
        accessorFn: (merchant) => merchant.stores.length,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stores" />,
      },
      {
        id: "rating",
        accessorFn: (merchant) => merchant.ratingScore ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
        cell: ({ row }) =>
          row.original.ratingScore ? (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" />
              {row.original.ratingScore.toFixed(1)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = merchantStatus(row.original)
          return <StatusBadge label={status.label} tone={status.tone} />
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
      },
    ]

    if (!canManage) return base

    base.push({
      id: "actions",
      cell: ({ row }) => {
        const merchant = row.original
        // Not just "never reviewed" — a merchant rejected earlier and reconsidered still needs
        // Approve/Reject available, not just Activate/Deactivate, until they're actually approved.
        const needsApprovalDecision = !merchant.applicationApprovedAt

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={isPending}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
              {needsApprovalDecision ? (
                <>
                  <DropdownMenuItem onSelect={() => setAction({ type: "approve", merchant })}>
                    <CheckCircle2 /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setAction({ type: "reject", merchant })}>
                    <XCircle /> Reject
                  </DropdownMenuItem>
                </>
              ) : merchant.isActive ? (
                <DropdownMenuItem variant="destructive" onSelect={() => setAction({ type: "deactivate", merchant })}>
                  <XCircle /> Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => setAction({ type: "activate", merchant })}>
                  <CheckCircle2 /> Activate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    })

    return base
  }, [canManage, isPending])

  const dialogCopy: Record<ActionState["type"], { title: string; description: string; confirmLabel: string }> = {
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
    <>
      <DataTable
        columns={columns}
        data={merchants}
        isLoading={isPending}
        onRowClick={(merchant) => router.push(`/merchants/${merchant.id}`)}
        manualPagination={{
          pageIndex: meta.page - 1,
          pageSize: meta.offset,
          pageCount: meta.totalPages,
          totalCount: meta.total,
          onChange: ({ pageIndex, pageSize }) => {
            if (pageSize !== meta.offset) {
              updateParams({ limit: String(pageSize) })
            } else {
              updateParams({ page: String(pageIndex + 1) }, false)
            }
          },
        }}
        emptyState={
          <EmptyState title="No merchants found" description="Try a different search or filter." />
        }
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search merchant name…" />
            <FilterMultiSelect
              label="Status"
              options={STATUS_OPTIONS}
              selected={filters.statuses}
              onChange={(values) => updateParams({ status: values.join(",") })}
            />
            <ReloadButton />
          </div>
        }
      />

      {action ? (
        <ConfirmDialog
          open={Boolean(action)}
          onOpenChange={(open) => !open && setAction(null)}
          title={dialogCopy[action.type].title}
          description={dialogCopy[action.type].description}
          confirmLabel={dialogCopy[action.type].confirmLabel}
          destructive={action.type === "reject" || action.type === "deactivate"}
          requireReason={action.type === "reject" || action.type === "deactivate"}
          reasonLabel={action.type === "reject" ? "Rejection reason" : "Deactivation reason"}
          onConfirm={handleConfirmAction}
        />
      ) : null}
    </>
  )
}


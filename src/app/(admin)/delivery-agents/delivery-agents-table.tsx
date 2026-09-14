"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Bike,
  Building2,
  CheckCircle2,
  Circle,
  MapPin,
  MoreHorizontal,
  Star,
  X,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { applicationStatusBadge } from "@/lib/delivery-agents"
import type { AdminDeliveryAgent, DeliveryAgentSearchAction, PaginationMeta } from "@/lib/types"

import { setDeliveryAgentActiveStatusAction, updateDeliveryAgentApplicationStatusAction } from "./actions"

const STATUS_OPTIONS = [
  { value: "IN_REVIEW", label: "Under review" },
  { value: "PENDING_OFFICE_VISIT", label: "Pending office visit" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
]

const ONLINE_OPTIONS = [
  { value: "online", label: "Online now" },
  { value: "offline", label: "Offline" },
]

const ACTIVE_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const MEDIUM_OPTIONS = [
  { value: "motorbike", label: "Motorbike" },
  { value: "bicycle", label: "Bicycle" },
  { value: "foot", label: "Foot" },
]

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

type ActionState =
  | { type: "office_visit"; agent: AdminDeliveryAgent }
  | { type: "approve"; agent: AdminDeliveryAgent }
  | { type: "reject"; agent: AdminDeliveryAgent }
  | { type: "activate"; agent: AdminDeliveryAgent }
  | { type: "deactivate"; agent: AdminDeliveryAgent }

type DeliveryAgentsTableProps = {
  agents: AdminDeliveryAgent[]
  pagination: PaginationMeta
  filters: {
    status: string[]
    online: string[]
    active: string[]
    medium: string[]
    search: string
    searchAction: DeliveryAgentSearchAction
  }
  loadError?: string | null
}

const SEARCH_ACTION_LABELS: Record<DeliveryAgentSearchAction, string> = {
  FindDeliveryAgents: "Search",
  FindClosestToDeliveryAgentLocation: "Showing riders closest to agent",
  FindClosestToPickupLocation: "Showing riders closest to order's pickup location",
}

export function DeliveryAgentsTable({ agents, pagination, filters, loadError }: DeliveryAgentsTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [action, setAction] = useState<ActionState | null>(null)
  const isProximitySearch = filters.searchAction !== "FindDeliveryAgents"

  useEffect(() => {
    if (searchInput === filters.search) return
    // Typing manually always falls back to a plain name/email/id search — a proximity
    // search only fires when one of the two dedicated buttons below is clicked.
    const timeout = setTimeout(() => updateParams({ q: searchInput, searchAction: undefined }), 400)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  function runProximitySearch(searchAction: DeliveryAgentSearchAction) {
    if (!searchInput.trim()) return
    updateParams({ q: searchInput, searchAction })
  }

  async function handleConfirmAction(reason?: string): Promise<boolean> {
    if (!action) return false
    const { type, agent } = action

    const result =
      type === "office_visit"
        ? await updateDeliveryAgentApplicationStatusAction(agent.id, "PENDING_OFFICE_VISIT")
        : type === "approve"
          ? await updateDeliveryAgentApplicationStatusAction(agent.id, "APPROVED")
          : type === "reject"
            ? await updateDeliveryAgentApplicationStatusAction(agent.id, "REJECTED", reason)
            : type === "activate"
              ? await setDeliveryAgentActiveStatusAction(agent.id, true)
              : await setDeliveryAgentActiveStatusAction(agent.id, false, reason)

    if (result.error) {
      toast.error(result.error)
      return false
    }

    const name = `${agent.user.firstName} ${agent.user.lastName}`
    const messages: Record<ActionState["type"], string> = {
      office_visit: `${name} moved to pending office visit.`,
      approve: `${name} approved.`,
      reject: `${name}'s application rejected.`,
      activate: `${name} activated.`,
      deactivate: `${name} deactivated.`,
    }
    toast.success(messages[type])
    return true
  }

  const columns = useMemo<ColumnDef<AdminDeliveryAgent>[]>(
    () => [
      {
        id: "name",
        accessorFn: (agent) => `${agent.user.firstName} ${agent.user.lastName}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
        cell: ({ row }) => {
          const agent = row.original
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">{initials(agent.user.firstName, agent.user.lastName)}</AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="font-medium">
                  {agent.user.firstName} {agent.user.lastName}
                </div>
                <div className="text-xs text-muted-foreground">{agent.user.email}</div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "deliveryMedium",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Medium" />,
        cell: ({ getValue }) => <span className="capitalize">{(getValue() as string).toLowerCase()}</span>,
      },
      {
        id: "online",
        accessorFn: (agent) => agent.isOnline,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Live status" />,
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-sm">
            <Circle
              className={
                getValue()
                  ? "size-2.5 fill-success text-success"
                  : "size-2.5 fill-muted-foreground/40 text-muted-foreground/40"
              }
            />
            {getValue() ? "Online" : "Offline"}
          </span>
        ),
      },
      {
        id: "rating",
        accessorFn: (agent) => agent.ratingScore ?? 0,
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
        id: "activeOrders",
        accessorFn: (agent) => agent.totalOrdersUnderDelivery,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Active orders" />,
      },
      {
        id: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const status = applicationStatusBadge(row.original.applicationStatus, row.original.isActive)
          return <StatusBadge label={status.label} tone={status.tone} />
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const agent = row.original
          const status = agent.applicationStatus

          if (status === "REJECTED") return null

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
                {status === "IN_REVIEW" ? (
                  <DropdownMenuItem onSelect={() => setAction({ type: "office_visit", agent })}>
                    <Building2 /> Request office visit
                  </DropdownMenuItem>
                ) : null}
                {status === "IN_REVIEW" || status === "PENDING_OFFICE_VISIT" ? (
                  <>
                    <DropdownMenuItem onSelect={() => setAction({ type: "approve", agent })}>
                      <CheckCircle2 /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setAction({ type: "reject", agent })}>
                      <XCircle /> Reject
                    </DropdownMenuItem>
                  </>
                ) : null}
                {status === "APPROVED" ? (
                  agent.isActive ? (
                    <DropdownMenuItem variant="destructive" onSelect={() => setAction({ type: "deactivate", agent })}>
                      <XCircle /> Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => setAction({ type: "activate", agent })}>
                      <CheckCircle2 /> Activate
                    </DropdownMenuItem>
                  )
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [isPending],
  )

  const dialogCopy: Record<ActionState["type"], { title: string; description: string; confirmLabel: string }> = {
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
    activate: {
      title: "Activate delivery agent?",
      description: "This restores their access to receive delivery requests.",
      confirmLabel: "Activate",
    },
    deactivate: {
      title: "Deactivate delivery agent?",
      description: "They'll lose access to receive delivery requests until reactivated.",
      confirmLabel: "Deactivate",
    },
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={agents}
        isLoading={isPending}
        onRowClick={(agent) => router.push(`/delivery-agents/${agent.id}`)}
        manualPagination={{
          pageIndex: pagination.currentPage - 1,
          pageSize: pagination.limit,
          pageCount: pagination.totalNumberOfPages,
          totalCount: pagination.totalNumberOfRecords,
          onChange: ({ pageIndex, pageSize }) => {
            if (pageSize !== pagination.limit) {
              updateParams({ limit: String(pageSize) })
            } else {
              updateParams({ page: String(pageIndex + 1) }, false)
            }
          },
        }}
        emptyState={
          loadError ? (
            <EmptyState title="Search failed" description={loadError} />
          ) : (
            <EmptyState title="No delivery agents found" description="Try a different search or filter." />
          )
        }
        toolbar={
          <div className="space-y-3">
            {isProximitySearch ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-info/25 bg-info/10 p-2.5 text-sm text-info">
                <span>
                  {SEARCH_ACTION_LABELS[filters.searchAction]} <span className="font-medium">{filters.search}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-info hover:text-info"
                  onClick={() => updateParams({ searchAction: undefined })}
                >
                  <X /> Clear
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search name, email, agent ID, or order ID…"
              />
              <FilterMultiSelect
                label="Status"
                options={STATUS_OPTIONS}
                selected={filters.status}
                onChange={(values) => updateParams({ status: values.join(",") })}
              />
              <FilterMultiSelect
                label="Live status"
                options={ONLINE_OPTIONS}
                selected={filters.online}
                onChange={(values) => updateParams({ online: values.join(",") })}
              />
              <FilterMultiSelect
                label="Account status"
                options={ACTIVE_OPTIONS}
                selected={filters.active}
                onChange={(values) => updateParams({ active: values.join(",") })}
              />
              <FilterMultiSelect
                label="Medium"
                options={MEDIUM_OPTIONS}
                selected={filters.medium}
                onChange={(values) => updateParams({ medium: values.join(",") })}
              />
              <ReloadButton />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!searchInput.trim()}
                onClick={() => runProximitySearch("FindClosestToDeliveryAgentLocation")}
              >
                <Bike /> Find closest riders to this agent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!searchInput.trim()}
                onClick={() => runProximitySearch("FindClosestToPickupLocation")}
              >
                <MapPin /> Find closest riders to order pickup location
              </Button>
            </div>
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

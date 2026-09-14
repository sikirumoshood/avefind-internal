"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ExternalLink, MoreHorizontal, Pencil, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ReloadButton } from "@/components/data-table/reload-button"
import { useTableUrlState } from "@/components/data-table/use-table-url-state"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { BANNER_STATUS_TONE, BANNER_TYPE_LABELS, bannerDisplayStatus } from "@/lib/banners"
import type { AdminBanner, PaginationMeta } from "@/lib/types"
import { resolveAssetUrl } from "@/lib/utils"

import { BannerFormDialog } from "./banner-form-dialog"
import { setBannerActiveStatusAction } from "./actions"

type BannersTableProps = {
  banners: AdminBanner[]
  pagination: PaginationMeta
  filters: { status: string; type: string }
  canManage: boolean
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  ...Object.entries(BANNER_TYPE_LABELS)
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label)),
]

export function BannersTable({ banners, pagination, filters, canManage }: BannersTableProps) {
  const router = useRouter()
  const { isPending, updateParams } = useTableUrlState()
  const [toggleTarget, setToggleTarget] = useState<AdminBanner | null>(null)

  async function handleToggleConfirm(): Promise<boolean> {
    if (!toggleTarget) return false
    const nextIsActive = Boolean(toggleTarget.deactivationDate)
    const result = await setBannerActiveStatusAction(toggleTarget.id, nextIsActive)
    if (result.error) {
      toast.error(result.error)
      return false
    }
    toast.success(nextIsActive ? "Banner activated." : "Banner deactivated.")
    router.refresh()
    return true
  }

  const columns: ColumnDef<AdminBanner>[] = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="relative h-12 w-20 overflow-hidden rounded-md border bg-muted">
          <Image src={resolveAssetUrl(row.original.imageS3Key)} alt="" fill className="object-cover" unoptimized />
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ getValue }) => BANNER_TYPE_LABELS[getValue() as keyof typeof BANNER_TYPE_LABELS],
    },
    {
      id: "cta",
      header: "CTA",
      cell: ({ row }) =>
        row.original.ctaUrl ? (
          <a
            href={row.original.ctaUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm hover:underline"
          >
            <span className="max-w-40 truncate">{row.original.ctaUrl}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = bannerDisplayStatus(row.original)
        return <StatusBadge label={status} tone={BANNER_STATUS_TONE[status]} />
      },
    },
    {
      accessorKey: "displayStartDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Starts" />,
      cell: ({ getValue }) => format(new Date(getValue() as string), "MMM d, yyyy p"),
    },
    {
      accessorKey: "displayEndDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ends" />,
      cell: ({ getValue }) => {
        const value = getValue() as string | null
        return value ? format(new Date(value), "MMM d, yyyy p") : <span className="text-muted-foreground">—</span>
      },
    },
    ...(canManage
      ? [
          {
            id: "actions",
            cell: ({ row }: { row: { original: AdminBanner } }) => {
              const banner = row.original
              const isActive = !banner.deactivationDate
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <BannerFormDialog
                      banner={banner}
                      trigger={
                        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem
                      variant={isActive ? "destructive" : "default"}
                      onSelect={() => setToggleTarget(banner)}
                    >
                      {isActive ? (
                        <>
                          <PowerOff /> Deactivate
                        </>
                      ) : (
                        <>
                          <Power /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          } satisfies ColumnDef<AdminBanner>,
        ]
      : []),
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={banners}
        isLoading={isPending}
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
        emptyState={<EmptyState title="No banners found" description="Try a different filter." />}
        toolbar={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={filters.status} onValueChange={(value) => updateParams({ status: value })}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => updateParams({ type: value })}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ReloadButton />
          </div>
        }
      />

      {toggleTarget ? (
        <ConfirmDialog
          open={Boolean(toggleTarget)}
          onOpenChange={(open) => !open && setToggleTarget(null)}
          title={toggleTarget.deactivationDate ? "Activate this banner?" : "Deactivate this banner?"}
          description={
            toggleTarget.deactivationDate
              ? "It will show again immediately if within its display window."
              : "It will stop showing to users immediately."
          }
          confirmLabel={toggleTarget.deactivationDate ? "Activate" : "Deactivate"}
          destructive={!toggleTarget.deactivationDate}
          onConfirm={handleToggleConfirm}
        />
      ) : null}
    </>
  )
}

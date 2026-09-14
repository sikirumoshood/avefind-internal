import { Megaphone, ShieldAlert } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listBanners } from "@/lib/api/banners"
import { first, parseLimit, parsePage } from "@/lib/pagination"
import { getSessionUser } from "@/lib/session"
import type { BannerType } from "@/lib/types"

import { BannerFormDialog } from "./banner-form-dialog"
import { BannersTable } from "./banners-table"

export const metadata: Metadata = { title: "Banners" }

export default async function BannersPage(props: PageProps<"/banners">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statusParam = first(searchParams.status)
  const typeParam = first(searchParams.type)
  const isActive = statusParam === "active" ? true : statusParam === "inactive" ? false : undefined
  const type = typeParam === "PROMOTION" || typeParam === "AFFILIATE_ADS" ? (typeParam as BannerType) : undefined

  const sessionUser = await getSessionUser()
  const canManage = sessionUser?.role.some((role) => role === "ADMIN" || role === "MANAGER") ?? false

  let banners: Awaited<ReturnType<typeof listBanners>> | null = null
  let loadError: string | null = null

  try {
    banners = await listBanners({ page, limit, isActive, type })
  } catch (error) {
    loadError =
      error instanceof ApiError && error.status === 403
        ? "Your role (Operations) doesn't have access to banners — only Admin and Manager do."
        : error instanceof ApiError
          ? error.message
          : "Failed to load banners."
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage in-app promotional and affiliate banners."
        actions={canManage ? <BannerFormDialog /> : undefined}
      />

      {loadError ? (
        <EmptyState icon={ShieldAlert} title="Couldn't load banners" description={loadError} />
      ) : banners && banners.data.length === 0 && !statusParam && !typeParam ? (
        <EmptyState icon={Megaphone} title="No banners yet" description="Create your first banner to get started." />
      ) : (
        <BannersTable
          banners={banners?.data ?? []}
          pagination={banners?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
          filters={{ status: statusParam ?? "all", type: typeParam ?? "all" }}
          canManage={canManage}
        />
      )}
    </div>
  )
}

import "server-only"

import { apiFetch } from "@/lib/api"
import type { AdminBanner, BannerType, Paginated } from "@/lib/types"

export type ListBannersParams = {
  page?: number
  limit?: number
  isActive?: boolean
  type?: BannerType
}

export function listBanners(params: ListBannersParams = {}) {
  const { page = 1, limit = 20, isActive, type } = params
  return apiFetch<Paginated<AdminBanner>>("orders", "/orders/banner/list", {
    method: "POST",
    body: {
      page,
      limit,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(type ? { type } : {}),
    },
  })
}

export type CreateBannerInput = {
  type: BannerType
  ctaUrl?: string
  imageS3Key: string
  displayStartDate?: string
  displayEndDate?: string
}

export function createBanner(input: CreateBannerInput) {
  return apiFetch<AdminBanner>("orders", "/orders/banner", { method: "POST", body: input })
}

export type UpdateBannerInput = {
  bannerId: string
  type?: BannerType
  ctaUrl?: string
  imageS3Key?: string
  displayStartDate?: string
  displayEndDate?: string
}

export function updateBanner(input: UpdateBannerInput) {
  return apiFetch<AdminBanner>("orders", "/orders/banner", { method: "PUT", body: input })
}

export function setBannerActiveStatus(bannerId: string, isActive: boolean) {
  return apiFetch<{ id: string }>("orders", `/orders/banner/${isActive ? "reactivate" : "deactivate"}`, {
    method: "PATCH",
    body: { bannerId },
  })
}

/** Presigned S3 PUT URL — the browser uploads the file bytes directly to `url`, then the resulting `fileAwsKey` is sent as imageS3Key. */
export function getBannerUploadLink(fileKey?: string) {
  return apiFetch<{ url: string; fileAwsKey: string }>("orders", "/orders/get-upload-link", {
    method: "POST",
    body: { fileKey },
  })
}

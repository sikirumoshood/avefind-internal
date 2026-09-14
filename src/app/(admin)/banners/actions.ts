"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import {
  createBanner,
  getBannerUploadLink,
  setBannerActiveStatus,
  updateBanner,
  type CreateBannerInput,
  type UpdateBannerInput,
} from "@/lib/api/banners"

type ActionResult = { error?: string; success?: true }
type UploadLinkResult = { error?: string; url?: string; fileAwsKey?: string }

function toErrorResult(error: unknown): { error: string } {
  return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
}

export async function getBannerUploadLinkAction(): Promise<UploadLinkResult> {
  try {
    const { url, fileAwsKey } = await getBannerUploadLink()
    return { url, fileAwsKey }
  } catch (error) {
    return toErrorResult(error)
  }
}

export async function createBannerAction(input: CreateBannerInput): Promise<ActionResult> {
  try {
    await createBanner(input)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/banners")
  return { success: true }
}

export async function updateBannerAction(input: UpdateBannerInput): Promise<ActionResult> {
  try {
    await updateBanner(input)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/banners")
  return { success: true }
}

export async function setBannerActiveStatusAction(bannerId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await setBannerActiveStatus(bannerId, isActive)
  } catch (error) {
    return toErrorResult(error)
  }
  revalidatePath("/banners")
  return { success: true }
}

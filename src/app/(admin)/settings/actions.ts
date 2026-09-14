"use server"

import { revalidatePath } from "next/cache"

import { ApiError } from "@/lib/api"
import { updateAppSetting } from "@/lib/api/settings"
import type { AppSettingType } from "@/lib/types"

type ActionResult = { error?: string; success?: true }

export async function updateAppSettingAction(settingType: AppSettingType, value: boolean): Promise<ActionResult> {
  try {
    await updateAppSetting(settingType, value)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Something went wrong. Please try again." }
  }
  revalidatePath("/settings")
  return { success: true }
}

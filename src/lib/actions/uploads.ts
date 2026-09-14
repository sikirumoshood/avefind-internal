"use server"

import { ApiError } from "@/lib/api"
import { getUploadLink, type UploadLink } from "@/lib/api/uploads"

export type UploadLinkResult = UploadLink | { error: string }

/** Shared by every attachment/image upload flow — see AttachmentUpload. */
export async function getAttachmentUploadLinkAction(fileKey?: string): Promise<UploadLinkResult> {
  try {
    return await getUploadLink(fileKey)
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Failed to get an upload link." }
  }
}

"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Plus, X } from "lucide-react"

import { getAttachmentUploadLinkAction } from "@/lib/actions/uploads"
import { resolveImageUrl } from "@/lib/utils"

import { ImageViewerModal } from "./image-viewer-modal"

type AttachmentUploadProps = {
  /** Bare S3 keys — never full URLs (see resolveImageUrl). */
  value: string[]
  onChange: (keys: string[]) => void
  maxFiles?: number
  accept?: string
  disabled?: boolean
  className?: string
}

/**
 * Reusable attachment uploader: uploads directly to S3 via a presigned URL from the
 * orders service (POST /orders/get-upload-link), then hands back the bare S3 key —
 * callers persist that key however their domain needs to (order return case, etc).
 * Shows a preview of every uploaded attachment (click to view full-size), lets the
 * user discard one and upload a replacement, up to `maxFiles`.
 */
export function AttachmentUpload({
  value,
  onChange,
  maxFiles = 5,
  accept = "image/*",
  disabled,
  className,
}: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)

    const remaining = maxFiles - value.length
    if (remaining <= 0) {
      setError(`You can upload up to ${maxFiles} attachments.`)
      return
    }

    const selected = Array.from(files).slice(0, remaining)
    setUploading(true)

    const uploadedKeys: string[] = []
    for (const file of selected) {
      const link = await getAttachmentUploadLinkAction()
      if ("error" in link) {
        setError(link.error)
        continue
      }

      const response = await fetch(link.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      if (!response.ok) {
        setError("An attachment failed to upload. Please try again.")
        continue
      }

      uploadedKeys.push(link.fileAwsKey)
    }

    setUploading(false)
    if (uploadedKeys.length > 0) onChange([...value, ...uploadedKeys])
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleRemove(key: string) {
    onChange(value.filter((item) => item !== key))
  }

  return (
    <div className={className}>
      {error ? <p className="mb-2 text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        {value.map((key, index) => (
          <div key={key} className="group relative size-20 overflow-hidden rounded-md border bg-muted">
            <button type="button" onClick={() => setViewerIndex(index)} className="block h-full w-full">
              <Image src={resolveImageUrl(key)} alt="" fill className="object-cover" unoptimized />
            </button>
            {!disabled ? (
              <button
                type="button"
                onClick={() => handleRemove(key)}
                aria-label="Remove attachment"
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>
        ))}

        {value.length < maxFiles && !disabled ? (
          <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            <span className="text-[10px]">{uploading ? "Uploading…" : "Add"}</span>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(event) => handleFilesSelected(event.target.files)}
            />
          </label>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{maxFiles} attachments
      </p>

      <ImageViewerModal
        images={value.map(resolveImageUrl)}
        index={viewerIndex}
        onOpenChange={(open) => !open && setViewerIndex(null)}
        onIndexChange={setViewerIndex}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"

import { cn, resolveImageUrl } from "@/lib/utils"

import { ImageViewerModal } from "./image-viewer-modal"

type AttachmentGalleryProps = {
  /** Bare S3 keys or full URLs — either is fine, resolveImageUrl handles both. */
  keys: string[]
  size?: "sm" | "md"
  className?: string
}

const SIZE_CLASSES: Record<NonNullable<AttachmentGalleryProps["size"]>, string> = {
  sm: "size-24",
  md: "h-40 w-full",
}

/** Read-only thumbnail grid — click any thumbnail to open it full-size in ImageViewerModal. */
export function AttachmentGallery({ keys, size = "sm", className }: AttachmentGalleryProps) {
  const [index, setIndex] = useState<number | null>(null)

  if (keys.length === 0) return null

  const urls = keys.map(resolveImageUrl)

  return (
    <>
      <div className={cn("flex flex-wrap gap-3", className)}>
        {keys.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => setIndex(i)}
            className={cn("relative overflow-hidden rounded-md border bg-muted", SIZE_CLASSES[size])}
          >
            <Image src={urls[i]} alt="" fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>

      <ImageViewerModal
        images={urls}
        index={index}
        onOpenChange={(open) => !open && setIndex(null)}
        onIndexChange={setIndex}
      />
    </>
  )
}

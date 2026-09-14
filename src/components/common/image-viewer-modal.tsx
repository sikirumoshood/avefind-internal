"use client"

import { useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type ImageViewerModalProps = {
  /** Fully-resolved image URLs (already run through resolveImageUrl). */
  images: string[]
  /** Which image is open; null closes the modal. */
  index: number | null
  onOpenChange: (open: boolean) => void
  /** Only needed when `images` has more than one entry, to support prev/next. */
  onIndexChange?: (index: number) => void
}

/**
 * Full-screen lightbox for viewing one or more images without leaving the page —
 * shared by anywhere attachments/photos render (order photos, delivery agent
 * documents, return case attachments, the attachment upload preview).
 */
export function ImageViewerModal({ images, index, onOpenChange, onIndexChange }: ImageViewerModalProps) {
  const open = index !== null && images.length > 0
  const current = index !== null ? images[index] : null

  function goTo(next: number) {
    if (!onIndexChange || images.length === 0) return
    onIndexChange((next + images.length) % images.length)
  }

  useEffect(() => {
    if (!open || images.length <= 1) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goTo((index ?? 0) - 1)
      if (event.key === "ArrowRight") goTo((index ?? 0) + 1)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-w-[calc(100%-2rem)] items-center justify-center border-none bg-transparent p-0 shadow-none sm:max-w-4xl"
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        {current ? (
          <div className="relative h-[85vh] w-full">
            <Image src={current} alt="" fill className="object-contain" unoptimized />
            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full"
                  onClick={() => goTo((index ?? 0) - 1)}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full"
                  onClick={() => goTo((index ?? 0) + 1)}
                >
                  <ChevronRight />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                  {(index ?? 0) + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

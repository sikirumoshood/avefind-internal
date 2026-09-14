"use client"

import { useId, useState, useTransition } from "react"
import type { ChangeEvent, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BANNER_TYPE_LABELS } from "@/lib/banners"
import type { AdminBanner, BannerType } from "@/lib/types"
import { resolveAssetUrl } from "@/lib/utils"

import { createBannerAction, getBannerUploadLinkAction, updateBannerAction } from "./actions"

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return ""
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

type BannerFormDialogProps = {
  banner?: AdminBanner
  trigger?: ReactNode
}

export function BannerFormDialog({ banner, trigger }: BannerFormDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus /> New banner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit banner" : "Create banner"}</DialogTitle>
          <DialogDescription>Images upload directly and are served from the CDN.</DialogDescription>
        </DialogHeader>
        {open ? <BannerForm banner={banner} onClose={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function BannerForm({ banner, onClose }: { banner?: AdminBanner; onClose: () => void }) {
  const router = useRouter()
  const [type, setType] = useState<BannerType>(banner?.type ?? "PROMOTION")
  const [ctaUrl, setCtaUrl] = useState(banner?.ctaUrl ?? "")
  const [startDate, setStartDate] = useState(toDatetimeLocal(banner?.displayStartDate))
  const [endDate, setEndDate] = useState(toDatetimeLocal(banner?.displayEndDate))
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(banner ? resolveAssetUrl(banner.imageS3Key) : null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const fileId = useId()
  const ctaId = useId()
  const startId = useId()
  const endId = useId()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    if (selected) setPreview(URL.createObjectURL(selected))
  }

  function handleSubmit() {
    setError(null)

    if (type === "AFFILIATE_ADS" && !ctaUrl.trim()) {
      setError("A CTA link is required for affiliate ads.")
      return
    }
    if (!banner && !file) {
      setError("Select an image.")
      return
    }

    startTransition(async () => {
      let imageS3Key = banner?.imageS3Key

      if (file) {
        const link = await getBannerUploadLinkAction()
        if (link.error || !link.url || !link.fileAwsKey) {
          setError(link.error ?? "Failed to get an upload link.")
          return
        }

        const uploadResponse = await fetch(link.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        if (!uploadResponse.ok) {
          setError("Image upload failed. Please try again.")
          return
        }
        imageS3Key = link.fileAwsKey
      }

      const shared = {
        type,
        ctaUrl: ctaUrl.trim() || undefined,
        displayStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        displayEndDate: endDate ? new Date(endDate).toISOString() : undefined,
      }

      const result = banner
        ? await updateBannerAction({ bannerId: banner.id, ...shared, imageS3Key })
        : await createBannerAction({ ...shared, imageS3Key: imageS3Key as string })

      if (result.error) {
        setError(result.error)
        return
      }

      toast.success(banner ? "Banner updated." : "Banner created.")
      onClose()
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-4">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={fileId}>Image</Label>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview before upload; not a persisted CDN asset
            <img src={preview} alt="" className="h-32 w-full rounded-md border object-cover" />
          ) : null}
          <Input id={fileId} type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(value) => setType(value as BannerType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(BANNER_TYPE_LABELS) as [BannerType, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={ctaId}>CTA link{type === "AFFILIATE_ADS" ? "" : " (optional)"}</Label>
          <Input
            id={ctaId}
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            placeholder="https://…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={startId}>Start</Label>
            <Input
              id={startId}
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={endId}>End (optional)</Label>
            <Input
              id={endId}
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {banner ? "Save changes" : "Create banner"}
        </Button>
      </DialogFooter>
    </>
  )
}

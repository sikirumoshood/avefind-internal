import { format } from "date-fns"
import Image from "next/image"

import { StatusBadge } from "@/components/common/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { isOffer, merchantOrderRequestStatusLabel, merchantOrderRequestStatusTone } from "@/lib/orders"
import { formatCurrency, resolveImageUrl } from "@/lib/utils"
import type { OrderCustomer, OrderMerchantRequest } from "@/lib/types"

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

export function MerchantRequestsList({ requests, customer }: { requests: OrderMerchantRequest[]; customer: OrderCustomer }) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground">No merchants have been offered this order yet.</p>
  }

  const sorted = [...requests].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <ul className="space-y-3">
      {sorted.map((request) => {
        const offer = isOffer(request)
        return (
          <li key={request.id} className="flex items-start justify-between gap-4 rounded-md border p-3 text-sm">
            <div className="flex items-start gap-3">
              {offer ? (
                <div className="flex -space-x-2">
                  <Avatar size="sm" className="ring-2 ring-background">
                    <AvatarImage
                      src={request.store?.merchant?.logoUrl ? resolveImageUrl(request.store.merchant.logoUrl) : undefined}
                      alt=""
                    />
                    <AvatarFallback className="text-xs">{(request.store?.merchant?.name ?? "?").at(0)}</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm" className="ring-2 ring-background">
                    <AvatarImage src={customer.profileUrl ? resolveImageUrl(customer.profileUrl) : undefined} alt="" />
                    <AvatarFallback className="text-xs">{initials(customer.firstName, customer.lastName)}</AvatarFallback>
                  </Avatar>
                </div>
              ) : null}
              <div className="space-y-0.5">
                <p className="font-medium">{request.store?.name ?? "Unknown store"}</p>
                <p className="text-xs text-muted-foreground">{request.store?.merchant?.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Offered {format(new Date(request.createdAt), "MMM d, yyyy p")}</p>
                {request.acceptedAt ? (
                  <p className="text-xs text-muted-foreground">Accepted {format(new Date(request.acceptedAt), "MMM d, p")}</p>
                ) : null}
                {request.rejectedAt ? (
                  <p className="text-xs text-muted-foreground">
                    Rejected {format(new Date(request.rejectedAt), "MMM d, p")}
                    {request.statusReason ? ` — ${request.statusReason}` : ""}
                  </p>
                ) : null}
                {offer && request.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {request.attachments.map((attachment) => (
                      <a key={attachment} href={resolveImageUrl(attachment)} target="_blank" rel="noopener noreferrer">
                        <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                          <Image src={resolveImageUrl(attachment)} alt="" fill className="object-cover" unoptimized />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge label={merchantOrderRequestStatusLabel(request.status)} tone={merchantOrderRequestStatusTone(request.status)} />
              {offer ? (
                <span className="text-xs font-medium">Offered {formatCurrency(request.itemPriceFromMerchant!)}</span>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

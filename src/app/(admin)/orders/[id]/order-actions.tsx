"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardCheck, CreditCard, MoreHorizontal } from "lucide-react"

import { ApplyPaymentDialog } from "@/components/common/apply-payment-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { OrderStatus } from "@/lib/types"

import { ReviewOrderDialog } from "./review-order-dialog"

type OrderActionsProps = {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter()
  const [reviewOpen, setReviewOpen] = useState(false)
  const isPendingReview = currentStatus === "MANUAL_REVIEW"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            Actions <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!isPendingReview} onSelect={() => setReviewOpen(true)}>
            <ClipboardCheck /> Review pending order
          </DropdownMenuItem>
          <ApplyPaymentDialog
            orderId={orderId}
            onApplied={() => router.refresh()}
            trigger={
              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                <CreditCard /> Apply payment
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ReviewOrderDialog
        orderId={orderId}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onDone={() => router.refresh()}
      />
    </>
  )
}

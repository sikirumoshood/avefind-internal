"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminOrderReturnCaseDetail } from "@/lib/types"

import { UpdateStatusDialog } from "../update-status-dialog"

export function ReturnCaseDetailActions({ returnCase }: { returnCase: AdminOrderReturnCaseDetail }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Pencil /> Update status
      </Button>
      <UpdateStatusDialog returnCase={open ? returnCase : null} onOpenChange={setOpen} />
    </>
  )
}

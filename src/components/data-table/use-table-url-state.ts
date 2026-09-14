"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

/**
 * Shared by every server-paginated/filtered table (Users, Merchants,
 * Delivery Agents, Orders, Payments, ...): reads/writes filter and page
 * state as URL search params, so filters are shareable/bookmarkable and the
 * server component naturally re-fetches on navigation. `isPending` doubles
 * as the DataTable `isLoading` flag while a navigation is in flight.
 */
export function useTableUrlState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function updateParams(next: Record<string, string | undefined>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    if (resetPage) params.delete("page")

    startTransition(() => {
      router.push(params.size ? `${pathname}?${params.toString()}` : pathname)
    })
  }

  return { isPending, updateParams }
}

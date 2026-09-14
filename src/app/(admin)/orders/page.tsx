import { ShoppingCart } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { ApiError } from "@/lib/api"
import { listOrders } from "@/lib/api/orders"
import { ALL_ORDER_STATUSES } from "@/lib/orders"
import { first, parseLimit, parseList, parsePage } from "@/lib/pagination"
import type { OrderStatus } from "@/lib/types"

import { OrdersTable } from "./orders-table"

export const metadata: Metadata = { title: "Orders" }

export default async function OrdersPage(props: PageProps<"/orders">) {
  const searchParams = await props.searchParams

  const page = parsePage(searchParams.page)
  const limit = parseLimit(searchParams.limit)
  const statuses = parseList(searchParams.status).filter((value): value is OrderStatus =>
    ALL_ORDER_STATUSES.includes(value as OrderStatus),
  )
  const search = first(searchParams.q) || undefined
  const isEmail = search?.includes("@") ?? false

  let orders: Awaited<ReturnType<typeof listOrders>> | null = null
  let loadError: string | null = null

  try {
    orders = await listOrders({
      page,
      limit,
      email: isEmail ? search : undefined,
      orderId: !isEmail ? search : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
    })
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load orders."
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Search, review, and manage customer orders." />

      {loadError ? (
        <EmptyState icon={ShoppingCart} title="Couldn't load orders" description={loadError} />
      ) : (
        <OrdersTable
          orders={orders?.data ?? []}
          pagination={orders?.pagination ?? { currentPage: 1, limit, totalNumberOfPages: 1, totalNumberOfRecords: 0 }}
          filters={{ statuses, search: search ?? "" }}
        />
      )}
    </div>
  )
}

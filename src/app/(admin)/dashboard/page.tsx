import { Banknote, Bike, CheckCircle2, Clock, Gift, Package, ShoppingCart, Store, Users } from "lucide-react"
import type { Metadata } from "next"

import { EmptyState } from "@/components/common/empty-state"
import { StatCard } from "@/components/common/stat-card"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiError } from "@/lib/api"
import { getDashboardSummary } from "@/lib/api/dashboard"
import { formatDuration } from "@/lib/dashboard"
import { formatCurrency } from "@/lib/utils"

import { CategoryPieChart } from "./category-pie-chart"
import { MonthlyOrdersChart } from "./monthly-orders-chart"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  let summary: Awaited<ReturnType<typeof getDashboardSummary>> | null = null
  let loadError: string | null = null

  try {
    summary = await getDashboardSummary()
  } catch (error) {
    loadError = error instanceof ApiError ? error.message : "Failed to load dashboard data."
  }

  if (loadError || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Summary insights across orders, agents, and merchants." />
        <EmptyState icon={ShoppingCart} title="Couldn't load dashboard" description={loadError ?? undefined} />
      </div>
    )
  }

  const { today, timingFunnel, totals, monthlyOrders, completedOrdersByCategory } = summary

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Summary insights across orders, agents, and merchants." />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Today</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Orders pending pickup" value={today.ordersPendingPickup} icon={Package} />
          <StatCard label="Orders in delivery" value={today.ordersInDelivery} icon={Bike} />
          <StatCard label="Orders delivered today" value={today.ordersDeliveredToday} icon={CheckCircle2} />
          <StatCard label="Users from referrals today" value={today.usersFromReferralsToday} icon={Gift} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Delivery timing (median)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Payment → picked up"
            value={formatDuration(timingFunnel.paymentToPickupMedianSeconds)}
            icon={Clock}
          />
          <StatCard
            label="Payment → agent assigned"
            value={formatDuration(timingFunnel.paymentToAssignmentMedianSeconds)}
            icon={Clock}
          />
          <StatCard
            label="Acceptance → arrival"
            value={formatDuration(timingFunnel.acceptanceToArrivalMedianSeconds)}
            icon={Clock}
          />
          <StatCard
            label="Arrival → picked up"
            value={formatDuration(timingFunnel.arrivalToPickupMedianSeconds)}
            icon={Clock}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Totals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Merchants to date"
            value={totals.totalMerchants}
            hint={`${totals.totalActivatedMerchants} activated`}
            icon={Store}
          />
          <StatCard label="Users to date" value={totals.totalUsers} icon={Users} />
          <StatCard label="Orders completed to date" value={totals.totalOrdersCompleted} icon={ShoppingCart} />
          <StatCard label="Orders completed today" value={today.ordersDeliveredToday} icon={CheckCircle2} />
          <StatCard
            label="Gross revenue this month"
            value={formatCurrency(totals.grossRevenueThisMonth)}
            icon={Banknote}
          />
          <StatCard label="Gross revenue all time" value={formatCurrency(totals.grossRevenueAllTime)} icon={Banknote} />
          <StatCard label="Users from referrals this month" value={totals.usersFromReferralsThisMonth} icon={Gift} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Completed orders per month — {monthlyOrders.currentYearLabel} vs {monthlyOrders.previousYearLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyOrdersChart data={monthlyOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed orders by category</CardTitle>
          </CardHeader>
          <CardContent>
            {completedOrdersByCategory.length > 0 ? (
              <CategoryPieChart data={completedOrdersByCategory} />
            ) : (
              <EmptyState title="No completed orders yet" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

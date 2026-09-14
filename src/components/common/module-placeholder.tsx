import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/layout/page-header"

type ModulePlaceholderProps = {
  title: string
  description: string
  icon: LucideIcon
  /** e.g. "apps/orders" — which avefind-backend service this module will call. */
  service: string
}

/** Stand-in body for a sidebar module before its API integration lands. */
export function ModulePlaceholder({ title, description, icon, service }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title="Not wired up yet"
        description={`This screen will use the DataTable + form components already in place, backed by ${service} (avefind-backend).`}
      />
    </div>
  )
}

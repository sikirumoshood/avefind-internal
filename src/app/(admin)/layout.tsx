import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSessionUser } from "@/lib/session"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar user={user} />
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

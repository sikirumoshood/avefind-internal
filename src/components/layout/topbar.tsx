"use client"

import { LogOut, User as UserIcon } from "lucide-react"

import { logoutAction } from "@/app/actions/session"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { roleLabel } from "@/lib/roles"
import type { SessionPayload } from "@/lib/session"

import { ThemeToggle } from "./theme-toggle"

function initials(firstName: string, lastName: string) {
  return `${firstName.at(0) ?? ""}${lastName.at(0) ?? ""}`.toUpperCase()
}

export function Topbar({ user }: { user: SessionPayload }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{initials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <span className="hidden font-medium sm:inline">
              {user.firstName} {user.lastName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon />
              {user.role.map(roleLabel).join(", ")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <form action={logoutAction} className="w-full">
                <button type="submit" className="flex w-full items-center gap-2">
                  <LogOut />
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

import {
  Bike,
  CreditCard,
  Gift,
  LayoutDashboard,
  Megaphone,
  Percent,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tag,
  Undo2,
  type LucideIcon,
} from "lucide-react"

export type NavLeaf = {
  title: string
  href: string
}

export type NavItem = NavLeaf & {
  icon: LucideIcon
  /** Sub-links rendered under this item; the parent itself stays clickable. */
  items?: NavLeaf[]
}

/**
 * Single source of truth for the sidebar. Add a module here and it shows up
 * in nav + gets active-state highlighting for free — see AppSidebar.
 */
export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Admin",
    href: "/admin/users",
    icon: ShieldCheck,
    items: [{ title: "Users", href: "/admin/users" }],
  },
  { title: "Orders", href: "/orders", icon: ShoppingCart },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Delivery Agents", href: "/delivery-agents", icon: Bike },
  { title: "Merchants", href: "/merchants", icon: Store },
  { title: "Pricing", href: "/pricing", icon: Tag },
  { title: "Discounts", href: "/discounts", icon: Percent },
  { title: "Rewards", href: "/rewards", icon: Gift },
  { title: "Refunds / Returns", href: "/returns", icon: Undo2 },
  { title: "Banners", href: "/banners", icon: Megaphone },
  { title: "Settings", href: "/settings", icon: Settings },
]

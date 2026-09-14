import type { UserRole } from "@/lib/types"

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  DELIVERY_AGENT: "Delivery Agent",
  MERCHANT: "Merchant",
  SALES_REP: "Sales Rep",
  ADMIN: "Admin",
  MANAGER: "Manager",
  OPERATIONS: "Operations",
}

export function roleLabel(role: UserRole) {
  return ROLE_LABELS[role] ?? role
}

/**
 * Mirrors apps/auth ROLE_TO_USER_CREATION_MAP (avefind-backend
 * auth.interface.ts) — which staff roles a given role is allowed to grant
 * when creating a new user. Keep in sync if the backend map changes.
 */
export const ROLE_TO_USER_CREATION_MAP: Partial<Record<UserRole, UserRole[]>> = {
  ADMIN: ["ADMIN", "MANAGER", "OPERATIONS"],
  MANAGER: ["MANAGER", "OPERATIONS"],
  OPERATIONS: ["OPERATIONS"],
}

export function creatableRolesFor(role: UserRole): UserRole[] {
  return ROLE_TO_USER_CREATION_MAP[role] ?? []
}

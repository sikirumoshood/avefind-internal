import "server-only"

import { ApiError, apiFetch } from "@/lib/api"
import type { AdminUser, Paginated, UserRole } from "@/lib/types"

export type ListUsersParams = {
  page?: number
  limit?: number
  roles?: UserRole[]
  isActive?: boolean
  search?: string
}

export function listUsers(params: ListUsersParams = {}) {
  const { page = 1, limit = 200, ...rest } = params
  return apiFetch<Paginated<AdminUser>>("auth", "/auth/admin/users", {
    method: "POST",
    body: { page, limit, ...rest },
  })
}

export type CreateUserInput = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber: string
  role: UserRole
}

export function createUser(input: CreateUserInput) {
  return apiFetch<{ id: string }>("auth", "/auth/admin/user", {
    method: "POST",
    body: input,
  })
}

export function setUserActiveStatus(userId: string, isActive: boolean) {
  return apiFetch<{ id: string }>("auth", `/auth/admin/user/${userId}/${isActive ? "activate" : "deactivate"}`, {
    method: "POST",
  })
}

/** There's no GET /:id for a single user — `search` on the list endpoint matches against `id` too. */
export async function getUser(id: string): Promise<AdminUser> {
  const result = await listUsers({ search: id, limit: 5 })
  const user = result.data.find((candidate) => candidate.id === id)
  if (!user) throw new ApiError("User not found", 404)
  return user
}

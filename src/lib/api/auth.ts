import "server-only"

import { apiFetch } from "@/lib/api"
import type { LoggedInResponse, UserRole } from "@/lib/types"

export function login(input: { email: string; password: string; role: UserRole }) {
  return apiFetch<LoggedInResponse>("auth", "/auth/login", {
    method: "POST",
    body: input,
    skipAuth: true,
  })
}

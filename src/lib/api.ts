import "server-only"

import { services, type ServiceName } from "@/lib/config"
import { getSessionToken } from "@/lib/session"
import type { ApiErrorBody } from "@/lib/types"

export class ApiError extends Error {
  status: number
  body?: ApiErrorBody

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  /** Pass an explicit token (e.g. inside the login flow, before a cookie exists). */
  token?: string | null
  /** Skip attaching the session token entirely, for public endpoints. */
  skipAuth?: boolean
}

function extractMessage(payload: ApiErrorBody | undefined, fallback: string) {
  if (!payload) return fallback
  if (Array.isArray(payload.message)) return payload.message.join(", ")
  return payload.message ?? payload.error ?? fallback
}

/**
 * Thin fetch wrapper shared by every module (orders, payments, delivery
 * agents, ...) to call avefind-backend's independent microservices. Attaches
 * the admin's session JWT as a Bearer token by default, since each service
 * validates it directly (see libs/common/src/guards/roles.guard.ts).
 */
export async function apiFetch<T = unknown>(
  service: ServiceName,
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, token, skipAuth, headers, ...rest } = options

  const authToken = skipAuth ? undefined : (token ?? (await getSessionToken()))

  const response = await fetch(`${services[service]}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  const isJson = response.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? ((await response.json().catch(() => undefined)) as ApiErrorBody | T) : undefined

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload as ApiErrorBody, response.statusText),
      response.status,
      payload as ApiErrorBody,
    )
  }

  return payload as T
}

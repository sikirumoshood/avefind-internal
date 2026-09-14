import "server-only"

import { cookies } from "next/headers"
import { decodeJwt } from "jose"

import { SESSION_COOKIE } from "@/lib/config"
import type { UserRole } from "@/lib/types"

/** Shape of the JWT payload avefind-backend's auth service signs on login. */
export type SessionPayload = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole[]
  isActive: boolean
  iat: number
  exp?: number
}

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export async function createSessionCookie(token: string) {
  const payload = decodeJwt(token) as SessionPayload
  const expires = payload.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + DEFAULT_MAX_AGE_SECONDS * 1000)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value
}

/**
 * Decodes the session JWT without verifying its signature — we don't hold
 * the backend's signing secret. This is fine for optimistic UI/redirects
 * because every authenticated request forwards the raw token to the
 * relevant avefind-backend service, which re-validates it; an expired or
 * tampered token simply gets rejected there (see `apiFetch`).
 */
export async function getSessionUser(): Promise<SessionPayload | null> {
  const token = await getSessionToken()
  if (!token) return null

  try {
    const payload = decodeJwt(token) as SessionPayload
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

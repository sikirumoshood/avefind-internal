import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decodeJwt } from "jose"

import { SESSION_COOKIE } from "@/lib/config"

const PUBLIC_PATHS = ["/login"]

/**
 * Optimistic-only check (see lib/session.ts) — we don't hold the secret the
 * backend signs with, so this can't verify the token. It only decides
 * whether to bounce the request toward /login or away from it; every real
 * API call still gets validated (and can 401) by the owning service.
 */
function hasUsableSession(token: string | undefined): boolean {
  if (!token) return false
  try {
    const payload = decodeJwt(token) as { exp?: number }
    return !payload.exp || payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.includes(pathname)
  const authed = hasUsableSession(request.cookies.get(SESSION_COOKIE)?.value)

  if (!authed && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (authed && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

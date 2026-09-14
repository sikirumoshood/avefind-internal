/**
 * avefind-backend is a set of independent NestJS microservices (no shared
 * gateway) — each module here talks to the one it needs directly.
 * See the apps directory in the avefind-backend repo for routes per service.
 */
export const services = {
  auth: process.env.AUTH_SERVICE_URL ?? "http://localhost:3001",
  orders: process.env.ORDERS_SERVICE_URL ?? "http://localhost:3002",
  payments: process.env.PAYMENTS_SERVICE_URL ?? "http://localhost:4001",
  analytics: process.env.ANALYTICS_SERVICE_URL ?? "http://localhost:4002",
  logistics: process.env.LOGISTICS_SERVICE_URL ?? "http://localhost:4004",
} as const

export type ServiceName = keyof typeof services

/** Shared with proxy.ts, which can't import lib/session.ts (server-only + next/headers). */
export const SESSION_COOKIE = "af_session"

/**
 * CDN in front of the private S3 bucket — models that store a bare
 * `*S3Key` (e.g. Banner.imageS3Key) resolve to a viewable image via
 * `${ASSET_BASE_URL}/${key}`. Public (NEXT_PUBLIC_) since it's rendered
 * client-side in <img> tags.
 */
export const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "https://d3fz32v9ube9lf.cloudfront.net"


import { ASSET_BASE_URL } from "@/lib/config"

export { cn } from "cn"

/** Resolves a bare S3 key (e.g. Banner.imageS3Key) to a viewable CDN URL. */
export function resolveAssetUrl(s3Key: string) {
  return `${ASSET_BASE_URL}/${s3Key}`
}

/** Some image fields are already full URLs (e.g. profileUrl, logoUrl), others are bare S3 keys (e.g. imageS3Key). */
export function resolveImageUrl(value: string) {
  return value.startsWith("http") ? value : resolveAssetUrl(value)
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
})

/** avefind-backend defaults every Order to NGN today — see Prisma CurrencyEnum. */
export function formatCurrency(amount: number | string) {
  return currencyFormatter.format(Number(amount))
}

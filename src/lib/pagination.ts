const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]

export function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export function parsePage(value: string | string[] | undefined) {
  const parsed = Number(first(value))
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

/** Validates against the same options the "Rows per page" control offers (data-table-pagination.tsx). */
export function parseLimit(value: string | string[] | undefined, fallback = 20) {
  const parsed = Number(first(value))
  return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : fallback
}

/** Splits a comma-joined multi-select filter param back into tokens, e.g. "a,b" -> ["a", "b"]. */
export function parseList(value: string | string[] | undefined): string[] {
  const raw = first(value)
  return raw ? raw.split(",").filter(Boolean) : []
}

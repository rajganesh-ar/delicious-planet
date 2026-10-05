/** Far past any real listing; only there to keep the OFFSET finite. */
const MAX_PAGE = 1000

/**
 * A `?page=` value as a page number Payload can use.
 *
 * Payload only defaults a falsy page to 1, and the offset is computed as
 * `(page - 1) * limit`, so `?page=-1` or `?page=Infinity` reached Postgres as
 * a negative or infinite OFFSET and the listing rendered the error page.
 */
export function pageParam(value: string | string[] | undefined | null): number {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Math.floor(Number(raw))
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, MAX_PAGE)
}

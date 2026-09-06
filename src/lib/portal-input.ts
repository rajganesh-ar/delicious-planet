import type { SelectOption } from './portal-options'

/**
 * Coercion helpers for the portal's public endpoints.
 *
 * Both routes take a JSON body from an unauthenticated browser and hand it to
 * the Local API with `overrideAccess: true` — which is to say, with admin
 * privileges. That is a deliberate trade: it keeps a sixty-field questionnaire
 * out of a publicly-creatable collection, at the cost of every value having to
 * be scrubbed here first.
 *
 * So nothing is copied across verbatim. A string that should be a string, a
 * number inside a plausible range, a select value that is genuinely one of the
 * offered options — anything else becomes undefined, and Payload's own
 * validation then decides whether its absence is fatal.
 */

/** Trimmed string, capped so a body cannot carry a megabyte in one field. */
export function str(value: unknown, maxLength = 2000): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

export function email(value: unknown): string | undefined {
  const text = str(value, 254)
  if (!text) return undefined
  // Deliberately loose. The authority on whether an address exists is whether
  // the message arrives; this only rejects what is obviously not one.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text.toLowerCase() : undefined
}

export function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 'on' || value === 1
}

export function num(value: unknown, min: number, max: number): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(str(value, 32))
  if (!Number.isFinite(parsed)) return undefined
  if (parsed < min || parsed > max) return undefined
  return parsed
}

/** One value, and only if the list actually offers it. */
export function pick(list: readonly SelectOption[], value: unknown): string | undefined {
  const text = str(value, 64)
  if (!text) return undefined
  return list.some((option) => option.value === text) ? text : undefined
}

/** Several values from the same list, de-duplicated and capped. */
export function pickMany(
  list: readonly SelectOption[],
  value: unknown,
  maxItems = 40,
): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const allowed = new Set(list.map((option) => option.value))
  const chosen = [...new Set(value.map((entry) => str(entry, 64)).filter(Boolean) as string[])]
    .filter((entry) => allowed.has(entry))
    .slice(0, maxItems)
  return chosen.length ? chosen : undefined
}

/** A positive integer id, as it arrives from a relationship picker. */
export function relationId(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(str(value, 32))
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function relationIds(value: unknown, maxItems = 40): number[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ids = [...new Set(value.map(relationId).filter((id): id is number => id != null))].slice(
    0,
    maxItems,
  )
  return ids.length ? ids : undefined
}

/** Array of objects, capped, with each row mapped through `row`. */
export function rows<T>(
  value: unknown,
  maxRows: number,
  row: (entry: Record<string, unknown>) => T | undefined,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined
  const mapped = value
    .slice(0, maxRows)
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
    .map(row)
    .filter((entry): entry is T => entry !== undefined)
  return mapped.length ? mapped : undefined
}

/** An ISO date, or nothing. Guards against `new Date('nonsense')`. */
export function isoDate(value: unknown): string | undefined {
  const text = str(value, 40)
  if (!text) return undefined
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

/** Drops every key whose value came back undefined. */
export function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

/**
 * @packageDocumentation
 * @internal
 */
import type { ArgumentSynopsis } from "../types"
import { getCleanNameFromNotation } from "../option/utils"

/**
 * Check if the argument is explicitly required
 *
 * @ignore
 * @param synopsis
 */
export function isRequired(synopsis: string): boolean {
  return synopsis.substring(0, 1) === "<"
}

/**
 *
 * @param synopsis
 */
export function isVariadic(synopsis: string): boolean {
  return synopsis.substr(-4, 3) === "..." || synopsis.endsWith("...")
}

export function parseArgumentSynopsis(synopsis: string): ArgumentSynopsis {
  synopsis = synopsis.trim()
  const rawName = getCleanNameFromNotation(synopsis, false)
  const name = getCleanNameFromNotation(synopsis)
  const required = isRequired(synopsis)
  const variadic = isVariadic(synopsis)
  const cleanSynopsis = required
    ? `<${rawName}${variadic ? "..." : ""}>`
    : `[${rawName}${variadic ? "..." : ""}]`
  return {
    name,
    synopsis: cleanSynopsis,
    required,
    variadic,
  }
}

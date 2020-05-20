/**
 * @packageDocumentation
 * @internal
 */
import chalk from "chalk"
import { levenshtein } from "./levenshtein"

interface Suggestion {
  distance: number
  suggestion: string
}

const MAX_DISTANCE = 2

const sortByDistance = (a: Suggestion, b: Suggestion): number => a.distance - b.distance

const keepMeaningfulSuggestions = (s: Suggestion): boolean => s.distance <= MAX_DISTANCE

const possibilitesMapper = (input: string, p: string): Suggestion => {
  return { suggestion: p, distance: levenshtein(input, p) }
}

/**
 * Get autocomplete suggestions
 *
 * @param {String} input - User input
 * @param {String[]} possibilities - Possibilities to retrieve suggestions from
 */
export function getSuggestions(input: string, possibilities: string[]): string[] {
  return possibilities
    .map((p) => possibilitesMapper(input, p))
    .filter(keepMeaningfulSuggestions)
    .sort(sortByDistance)
    .map((p) => p.suggestion)
}

/**
 * Make diff bolder in a string
 *
 * @param from original string
 * @param to target string
 */
export function boldDiffString(from: string, to: string): string {
  return [...to]
    .map((char, index) => {
      if (char != from.charAt(index)) {
        return chalk.bold.greenBright(char)
      }
      return char
    })
    .join("")
}

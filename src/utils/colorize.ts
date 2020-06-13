/**
 * @packageDocumentation
 * @internal
 */
import c from "chalk"

export function colorize(text: string): string {
  return text
    .replace(/<([^>]+)>/gi, (match) => {
      return c.hex("#569cd6")(match)
    })
    .replace(/<command>/gi, (match) => {
      return c.keyword("orange")(match)
    })
    .replace(/\[([^[\]]+)\]/gi, (match) => {
      return c.hex("#aaa")(match)
    })
    .replace(/ --?([^\s,]+)/gi, (match) => {
      return c.green(match)
    })
}

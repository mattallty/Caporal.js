/**
 * @packageDocumentation
 * @internal
 */

import camelCase from "lodash/camelCase"
import kebabCase from "lodash/kebabCase"
import { FlagSyntaxError } from "../error"
import { OptionValueType } from "../types"
import type { OptionSynopsis, ParserTypes } from "../types"

const REG_SHORT_OPT = /^-[a-z]$/i
const REG_LONG_OPT = /^--[a-z]{2,}/i
const REG_OPT = /^(-[a-zA-Z]|--\D{1}[\w-]+)/

function isShortOpt(flag: string): boolean {
  return REG_SHORT_OPT.test(flag)
}

function isLongOpt(flag: string): boolean {
  return REG_LONG_OPT.test(flag)
}

/**
 * Specific version of camelCase which does not lowercase short flags
 *
 * @param name Flag short or long name
 */
function camelCaseOpt(name: string): string {
  return name.length === 1 ? name : camelCase(name)
}

export function getCleanNameFromNotation(str: string, camelCased = true): string {
  str = str
    .replace(/([[\]<>]+)/g, "")
    .replace("...", "")
    .replace(/^no-/, "")
  return camelCased ? camelCaseOpt(str) : str
}

export function getDashedOpt(name: string): string {
  const l = Math.min(name.length, 2)
  return "-".repeat(l) + kebabCase(name)
}

export function isNumeric(n: string): boolean {
  return !isNaN(parseFloat(n)) && isFinite(Number(n))
}

export function isOptionStr(str?: string): str is string {
  return str !== undefined && str !== "--" && REG_OPT.test(str)
}

export function isConcatenatedOpt(str: string): string[] | false {
  if (str.match(/^-([a-z]{2,})/i)) {
    return str.substr(1).split("")
  }
  return false
}

export function isNegativeOpt(opt: string): boolean {
  return opt.substr(0, 5) === "--no-"
}

export function isOptArray(flag: ParserTypes | ParserTypes[]): flag is ParserTypes[] {
  return Array.isArray(flag)
}

export function formatOptName(name: string): string {
  return camelCaseOpt(name.replace(/^--?(no-)?/, ""))
}

/**
 * Parse a option synopsis
 *
 * @example
 * parseSynopsis("-f, --file <path>")
 * // Returns...
 * {
 *    longName: 'file',
 *    longNotation: '--file',
 *    shortNotation: '-f',
 *    shortName: 'f'
 *    valueType: 0, // 0 = optional, 1 = required, 2 = no value
 *    variadic: false
 *    name: 'file'
 *    notation: '--file' // either the long or short notation
 * }
 *
 * @param synopsis
 * @ignore
 */
export function parseOptionSynopsis(synopsis: string): OptionSynopsis {
  // synopsis = synopsis.trim()
  const analysis: OptionSynopsis = {
    variadic: false,
    valueType: OptionValueType.None,
    valueRequired: false,
    allNames: [],
    allNotations: [],
    name: "",
    notation: "",
    synopsis,
  }

  const infos: Partial<OptionSynopsis> = synopsis
    .split(/[\s\t,]+/)
    .reduce((acc, value) => {
      if (isLongOpt(value)) {
        acc.longNotation = value
        acc.longName = getCleanNameFromNotation(value.substring(2))
        acc.allNames.push(acc.longName)
        acc.allNotations.push(value)
      } else if (isShortOpt(value)) {
        acc.shortNotation = value
        acc.shortName = value.substring(1)
        acc.allNames.push(acc.shortName)
        acc.allNotations.push(value)
      } else if (value.substring(0, 1) === "[") {
        acc.valueType = OptionValueType.Optional
        acc.valueRequired = false
        acc.variadic = value.substr(-4, 3) === "..."
      } else if (value.substring(0, 1) === "<") {
        acc.valueType = OptionValueType.Required
        acc.valueRequired = true
        acc.variadic = value.substr(-4, 3) === "..."
      }
      return acc
    }, analysis)

  if (infos.longName === undefined && infos.shortName === undefined) {
    throw new FlagSyntaxError(synopsis)
  }

  infos.name = infos.longName || (infos.shortName as string)
  infos.notation = infos.longNotation || (infos.shortNotation as string)

  const fullSynopsis = { ...infos } as OptionSynopsis

  return fullSynopsis
}

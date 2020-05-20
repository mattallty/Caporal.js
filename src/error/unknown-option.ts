/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import type { Option } from "../types"
import { getDashedOpt } from "../option/utils"
import { getGlobalOptions } from "../option"
import { getSuggestions, boldDiffString } from "../utils/suggest"
import c from "chalk"
import type { Command } from "../command"
import filter from "lodash/fp/filter"
import map from "lodash/fp/map"

/**
 * @todo Rewrite
 */
export class UnknownOptionError extends BaseError {
  constructor(flag: string, command: Command) {
    const longFlags = filter((f: Option) => f.name.length > 1),
      getFlagNames = map((f: Option) => f.name),
      possibilities = getFlagNames([
        ...longFlags(command.options),
        ...getGlobalOptions().keys(),
      ]),
      suggestions = getSuggestions(flag, possibilities)

    let msg = `Unknown option ${c.bold.redBright(getDashedOpt(flag))}. `
    if (suggestions.length) {
      msg +=
        "Did you mean " +
        suggestions
          .map((s) => boldDiffString(getDashedOpt(flag), getDashedOpt(s)))
          .join(" or maybe ") +
        " ?"
    }
    super(msg, { flag, command })
  }
}

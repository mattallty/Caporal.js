/**
 * @packageDocumentation
 * @internal
 */

import { BaseError, CommonError } from "./base"
import chalk from "chalk"
import { colorize } from "../utils/colorize"
import type { Command } from "../command"

export class ValidationSummaryError extends BaseError {
  constructor(cmd: Command, errors: CommonError[]) {
    const plural = errors.length > 1 ? "s" : ""
    const msg =
      `The following error${plural} occured:\n` +
      errors.map((e) => "- " + e.message.replace(/\n/g, "\n  ")).join("\n") +
      "\n\n" +
      chalk.dim("Synopsis: ") +
      colorize(cmd.synopsis)
    super(msg, { errors })
  }
}

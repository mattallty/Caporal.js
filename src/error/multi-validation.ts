/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import chalk from "chalk"
import { colorize } from "../utils/colorize"
import type { Command } from "../command"

export class ValidationSummaryError extends BaseError {
  constructor(command: Command, errors: BaseError[]) {
    const plural = errors.length > 1 ? "s" : ""
    const msg =
      `The following error${plural} occured:\n` +
      errors.map((e) => "- " + e.message.replace(/\n/g, "\n  ")).join("\n") +
      "\n\n" +
      chalk.dim("Synopsis: ") +
      colorize(command.synopsis)
    super(msg, { errors, command })
  }
}

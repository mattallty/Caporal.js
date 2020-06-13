/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Command } from "../command"
import { Option } from "../types"
import chalk from "chalk"

export class MissingFlagError extends BaseError {
  constructor(flag: Option, command: Command) {
    const msg = `Missing required flag ${chalk.bold(flag.allNotations.join(" | "))}.`
    super(msg, { flag, command })
  }
}

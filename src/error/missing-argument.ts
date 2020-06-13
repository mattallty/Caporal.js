/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Command } from "../command"
import { Argument } from "../types"
import chalk from "chalk"

export class MissingArgumentError extends BaseError {
  constructor(argument: Argument, command: Command) {
    const msg = `Missing required argument ${chalk.bold(argument.name)}.`
    super(msg, { argument, command })
  }
}

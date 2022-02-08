/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Command } from "../command"

export class ActionError extends BaseError {
  constructor(error: string | Error, command: Command) {
    const message = typeof error === "string" ? error : error.message
    super(message, { error, command })
  }
}

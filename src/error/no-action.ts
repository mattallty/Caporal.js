/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Command } from "../command"

export class NoActionError extends BaseError {
  constructor(command?: Command) {
    let message
    if (command && !command.isProgramCommand()) {
      message = `Caporal Error: You haven't defined any action for command '${command.name}'.\nUse .action() to do so.`
    } else {
      message = `Caporal Error: You haven't defined any action for program.\nUse .action() to do so.`
    }
    super(message, { command })
  }
}

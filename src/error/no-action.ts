/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Command } from "../command"

export class NoActionError extends BaseError {
  constructor(cmd?: Command) {
    let message
    if (cmd && !cmd.isProgramCommand()) {
      message = `Caporal Error: You haven't defined any action for command '${cmd.name}'.\nUse .action() to do so.`
    } else {
      message = `Caporal Error: You haven't defined any action for program.\nUse .action() to do so.`
    }
    super(message, { cmd })
  }
}

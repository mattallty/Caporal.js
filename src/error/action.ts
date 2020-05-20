/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"

export class ActionError extends BaseError {
  constructor(error: string | Error) {
    const message = typeof error === "string" ? error : error.message
    super(message, { error })
  }
}

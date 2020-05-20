/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"

export class OptionSynopsisSyntaxError extends BaseError {
  constructor(synopsis: string) {
    super(`Syntax error in option synopsis: ${synopsis}`, { synopsis })
  }
}

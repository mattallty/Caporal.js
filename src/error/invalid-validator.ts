/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"
import { Validator } from "../types"
export class InvalidValidatorError extends BaseError {
  constructor(validator: Validator) {
    super("Caporal setup error: Invalid flag validator setup.", { validator })
  }
}

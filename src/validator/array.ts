/**
 * @packageDocumentation
 * @internal
 */

import type { ParserTypes, Argument, Option } from "../types"
import { ValidationError } from "../error"

/**
 * Validate using an array of valid values.
 *
 * @param validator
 * @param value
 * @ignore
 */
export function validateWithArray(
  validator: ParserTypes[],
  value: ParserTypes | ParserTypes[],
  context: Argument | Option,
): ParserTypes | ParserTypes[] {
  if (Array.isArray(value)) {
    value.forEach((v) => validateWithArray(validator, v, context))
  } else if (validator.includes(value) === false) {
    throw new ValidationError({
      validator,
      value,
      context,
    })
  }
  return value
}

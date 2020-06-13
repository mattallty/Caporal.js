/**
 * @packageDocumentation
 * @internal
 */

import type { ParserTypes, Argument, Option } from "../types"
import { ValidationError } from "../error"

/**
 * Validate using a RegExp
 *
 * @param validator
 * @param value
 * @ignore
 */
export function validateWithRegExp(
  validator: RegExp,
  value: ParserTypes | ParserTypes[],
  context: Argument | Option,
): ParserTypes | ParserTypes[] {
  if (Array.isArray(value)) {
    return value.map((v) => {
      return validateWithRegExp(validator, v, context) as ParserTypes
    })
  }
  if (!validator.test(value + "")) {
    throw new ValidationError({
      validator: validator,
      value,
      context,
    })
  }
  return value
}
